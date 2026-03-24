import mongoose from 'mongoose' 
import crypto from 'crypto' 
import connectDB from './db.js' 
import Wallet from '../models/Wallet.js' 
import CoinTransaction from '../models/CoinTransaction.js' 
import ShopItem from '../models/ShopItem.js' 
import User from '../models/User.js' 
 
import { isAdmin } from './admin.js'

// ━━━ CONSTANTS ━━━ 
 
export const COIN_VALUES = { 
  daily_login:          5, 
  post_created:         10, 
  first_post_of_day:    15, 
  like_received:        2, 
  comment_created:      5, 
  comment_received:     3, 
  poll_created:         10, 
  event_created:        25, 
  resource_approved:    50, 
  placement_shared:     30, 
  lost_found_resolved:  20, 
  streak_7day:          50, 
  streak_30day:         200, 
  referral_bonus:       100 
} 
 
export const DAILY_CAP = 200 
 
const EQUIP_FIELD_MAP = { 
  avatar_frame:    'equipped.avatarFrame', 
  username_color:  'equipped.usernameColor', 
  profile_banner:  'equipped.profileBanner', 
  post_badge:      'equipped.postBadge', 
  chat_bubble:     'equipped.chatBubble', 
  bio_theme:       'equipped.bioTheme', 
  special_badge:   'equipped.postBadge',  // special badges equip as post badge 
  profile_theme:   'equipped.profileTheme',
  effect:          'equipped.effect'
} 
 
// ━━━ HELPERS ━━━ 
 
function makeIdempotencyKey(userId, reason, referenceId) { 
  const today = new Date().toISOString().split('T')[0] 
  const parts = [userId.toString(), reason, referenceId || 'none', today] 
  return crypto.createHash('sha256').update(parts.join('_')).digest('hex') 
} 
 
function getReferenceType(reason) { 
  const map = { 
    post_created: 'post', 
    first_post_of_day: 'post', 
    like_received: 'post', 
    comment_created: 'post', 
    comment_received: 'post', 
    resource_approved: 'resource', 
    placement_shared: 'post', 
    lost_found_resolved: 'post' 
  } 
  return map[reason] || null 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// GET OR CREATE WALLET 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function getOrCreateWallet(userId) { 
  await connectDB() 
 
  const wallet = await Wallet.findOneAndUpdate( 
    { userId }, 
    { $setOnInsert: { userId } }, 
    { upsert: true, returnDocument: 'after' } 
  ) 
 
  return wallet 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// AWARD COINS 
// Call fire-and-forget: awardCoins(...).catch(() => {}) 
// Returns: { success, coinsAwarded, newBalance } or { success: false, reason } 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function awardCoins(userId, reason, referenceId = null) { 
 
  // Validate reason 
  const coinValue = COIN_VALUES[reason] 
  if (!coinValue) { 
    console.error(`[Coins] Unknown reason: ${reason}`) 
    return { success: false, reason: 'unknown_reason' } 
  } 
 
  const idempotencyKey = makeIdempotencyKey(userId, reason, referenceId) 
 
  try { 
    await connectDB() 
 
    // ━━━ Step 1: Idempotency check ━━━ 
    const alreadyRewarded = await CoinTransaction 
      .findOne({ idempotencyKey }) 
      .lean() 
 
    if (alreadyRewarded) { 
      return { success: false, reason: 'already_rewarded' } 
    } 
 
    // ━━━ Step 2: Get wallet + daily reset ━━━ 
    const wallet = await getOrCreateWallet(userId) 
    const today = new Date() 
    today.setHours(0, 0, 0, 0) 
 
    let todayEarned = wallet.todayEarned 
 
    // Reset daily counter if new day 
    if (!wallet.todayResetAt || wallet.todayResetAt < today) { 
      await Wallet.findOneAndUpdate( 
        { userId }, 
        { $set: { todayEarned: 0, todayResetAt: today } } 
      ) 
      todayEarned = 0 
    } 
 
    // ━━━ Step 3: Daily cap check ━━━ 
    if (todayEarned >= DAILY_CAP) { 
      return { 
        success: false, 
        reason: 'daily_cap_reached', 
        message: `Daily limit of ${DAILY_CAP} coins reached. Come back tomorrow!` 
      } 
    } 
 
    // ━━━ Step 4: Calculate actual coins ━━━ 
    const remaining = DAILY_CAP - todayEarned 
    const actualCoins = Math.min(coinValue, remaining) 
 
    // ━━━ Step 5 & 6: Update wallet + Transaction log (Atomic if possible) ━━━ 
    let session = null 
    try { 
      session = await mongoose.startSession() 
    } catch { session = null } 
 
    let newBalance = 0 
 
    const execute = async (sess) => { 
      const opts = sess ? { session: sess } : {} 
 
      // Update wallet 
      const updated = await Wallet.findOneAndUpdate( 
        { userId }, 
        { 
          $inc: { 
            balance: actualCoins, 
            totalEarned: actualCoins, 
            todayEarned: actualCoins 
          } 
        }, 
        { returnDocument: 'after', ...opts } 
      ) 
 
      if (!updated) {
        console.error('[Coins] Wallet not found for userId:', userId)
        throw new Error('Wallet not found')
      }
      newBalance = updated.balance 
 
      // Transaction log 
      await CoinTransaction.create([{ 
        userId, 
        type: 'earn', 
        amount: actualCoins, 
        balanceAfter: newBalance, 
        reason, 
        referenceId: referenceId || null, 
        referenceType: getReferenceType(reason), 
        idempotencyKey 
      }], sess ? { session: sess } : {}) 
 
      // Whale badge check 
      const prevTotal = updated.totalEarned - actualCoins 
      if (prevTotal < 10000 && updated.totalEarned >= 10000) { 
        await awardWhaleBadge(userId, sess).catch(err => {
            console.error('[Coins] Whale badge award failed:', err.message)
        }) 
      } 
    } 
 
    if (session) { 
      await session.withTransaction(() => execute(session)) 
      await session.endSession() 
    } else { 
      await execute(null) 
    } 
 
    return { 
      success: true, 
      coinsAwarded: actualCoins, 
      newBalance 
    } 
 
  } catch (err) { 
    // Silently fail — never break the main action 
    console.error('[Coins] Award failed:', err.message) 
    return { success: false, reason: 'error' } 
  } 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// SPEND COINS — Shop purchase 
// Atomic: deduct + add to inventory together 
// Returns: { success, newBalance, item } or { success: false, reason } 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function spendCoins(userId, itemSlug) { 
  await connectDB() 
 
  // ━━━ Validate item ━━━ 
  const item = await ShopItem.findOne({ 
    slug: itemSlug, 
    isActive: true 
  }).lean() 
 
  if (!item) return { success: false, reason: 'item_not_found' } 
 
  // ━━━ Stock check ━━━ 
  if (item.maxStock !== null && item.soldCount >= item.maxStock) { 
    return { success: false, reason: 'out_of_stock' } 
  } 
 
  // ━━━ Time limit check ━━━ 
  if (item.limitedUntil && item.limitedUntil < new Date()) { 
    return { success: false, reason: 'item_expired' } 
  } 
 
  // ━━━ Ownership check ━━━ 
  const wallet = await getOrCreateWallet(userId) 
  const alreadyOwned = wallet.inventory.some( 
    inv => inv.itemId.toString() === item._id.toString() 
  ) 
  if (alreadyOwned) return { success: false, reason: 'already_owned' } 
 
  // ━━━ Balance check ━━━ 
  if (wallet.balance < item.price) { 
    return { 
      success: false, 
      reason: 'insufficient_balance', 
      required: item.price, 
      current: wallet.balance, 
      shortfall: item.price - wallet.balance 
    } 
  } 
 
  // ━━━ Atomic purchase (MongoDB session) ━━━ 
  const idempotencyKey = makeIdempotencyKey(userId, 'shop_purchase', item._id)

  let session = null 
  try { 
    session = await mongoose.startSession() 
  } catch { session = null } 
 
  try { 
    let newBalance = 0 
 
    const execute = async (sess) => { 
      const opts = sess ? { session: sess } : {} 
 
      // Deduct from wallet + add to inventory 
      const updatedWallet = await Wallet.findOneAndUpdate( 
        { 
          userId, 
          balance: { $gte: item.price }  // double-check balance in query 
        }, 
        { 
          $inc: { 
            balance: -item.price, 
            totalSpent: item.price 
          }, 
          $push: { 
            inventory: { 
              itemId: item._id, 
              purchasedAt: new Date() 
            } 
          } 
        }, 
        { returnDocument: 'after', ...opts } 
      ) 
 
      if (!updatedWallet) throw new Error('Balance check failed') 
      newBalance = updatedWallet.balance 
 
      // Increment sold count 
      await ShopItem.findByIdAndUpdate( 
        item._id, 
        { $inc: { soldCount: 1 } }, 
        opts 
      ) 
 
      // Transaction log 
      await CoinTransaction.create([{ 
        userId, 
        type: 'spend', 
        amount: item.price, 
        balanceAfter: newBalance, 
        reason: 'shop_purchase', 
        referenceId: item._id, 
        referenceType: 'shop_item',
        idempotencyKey
      }], sess ? { session: sess } : {}) 
    } 
 
    if (session) { 
      await session.withTransaction(() => execute(session)) 
      await session.endSession() 
    } else { 
      await execute(null) 
    } 
 
    return { 
      success: true, 
      newBalance, 
      item: { 
        _id: item._id, 
        slug: item.slug, 
        name: item.name, 
        category: item.category, 
        visual: item.visual 
      } 
    } 
 
  } catch (err) { 
    if (session) { 
      try { await session.endSession() } catch {} 
    } 
    console.error('[Coins] Purchase failed:', err.message) 
    return { success: false, reason: 'transaction_failed' } 
  } 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// EQUIP ITEM 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function equipItem(userId, itemSlug) { 
  await connectDB() 
 
  const item = await ShopItem.findOne({ slug: itemSlug }).lean() 
  if (!item) return { success: false, reason: 'item_not_found' } 
 
  // Verify ownership 
  const wallet = await Wallet.findOne({ userId }).lean() 
  const owned = wallet?.inventory?.some( 
    inv => inv.itemId.toString() === item._id.toString() 
  ) 
  if (!owned) return { success: false, reason: 'not_owned' } 
 
  const field = EQUIP_FIELD_MAP[item.category] 
  if (!field) return { success: false, reason: 'not_equippable' } 
 
  await Wallet.findOneAndUpdate( 
    { userId }, 
    { $set: { [field]: itemSlug } } 
  ) 
 
  return { success: true, slot: field.split('.')[1], equipped: itemSlug } 
 } 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// UNEQUIP ITEM 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function unequipSlot(userId, slot) { 
  await connectDB() 
 
  const validSlots = [ 
    'avatarFrame', 'usernameColor', 'profileBanner', 
    'postBadge', 'chatBubble', 'bioTheme', 'profileTheme', 'effect'
  ] 
  if (!validSlots.includes(slot)) { 
    return { success: false, reason: 'invalid_slot' } 
  } 
 
  await Wallet.findOneAndUpdate( 
    { userId }, 
    { $set: { [`equipped.${slot}`]: null } } 
  ) 
 
  return { success: true } 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// GIFT COINS 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function giftCoins(fromUserId, toUserId, amount) { 
 
  if (fromUserId.toString() === toUserId.toString()) { 
    return { success: false, reason: 'cannot_gift_self' } 
  } 
 
  await connectDB() 
  const sender = await User.findById(fromUserId).select('username').lean()
  const senderIsFounder = sender && isAdmin(sender) // Using isAdmin as it checks for founder privileges too, or isFounder if preferred

  // Limits for normal users: 10 - 1000
  if (!senderIsFounder) {
    if (!Number.isInteger(amount) || amount < 10 || amount > 1000) { 
      return { success: false, reason: 'invalid_amount', min: 10, max: 1000 } 
    } 
  } else {
    // Limits for founder: min 1, no max (except balance)
    if (!Number.isInteger(amount) || amount < 1) {
      return { success: false, reason: 'invalid_amount', min: 1 }
    }
  }
 
  const senderWallet = await getOrCreateWallet(fromUserId) 
  if (senderWallet.balance < amount) { 
    return { 
      success: false, 
      reason: 'insufficient_balance', 
      current: senderWallet.balance, 
      shortfall: amount - senderWallet.balance 
    } 
  } 
 
  let session = null 
  try { 
    session = await mongoose.startSession() 
  } catch { session = null } 
 
  try { 
    let senderBalance = 0 
    let receiverBalance = 0 
 
    const execute = async (sess) => { 
      const opts = sess ? { session: sess } : {} 
 
      const sender = await Wallet.findOneAndUpdate( 
        { userId: fromUserId, balance: { $gte: amount } }, 
        { $inc: { balance: -amount, totalSpent: amount } }, 
        { returnDocument: 'after', ...opts } 
      ) 
      if (!sender) throw new Error('Sender balance check failed') 
      senderBalance = sender.balance 
 
      const receiver = await Wallet.findOneAndUpdate( 
        { userId: toUserId }, 
        { $inc: { balance: amount, totalEarned: amount } }, 
        { upsert: true, returnDocument: 'after', ...opts } 
      ) 
      receiverBalance = receiver.balance 
 
      // Transaction log 
      const giftId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) 
      const baseKey = crypto.createHash('sha256').update(`${fromUserId}_${toUserId}_${amount}_${giftId}`).digest('hex') 
 
      await CoinTransaction.create([ 
        { 
          userId: fromUserId, 
          type: 'gift_sent', 
          amount, 
          balanceAfter: senderBalance, 
          reason: 'gift_sent', 
          relatedUserId: toUserId, 
          idempotencyKey: `${baseKey}_sent` 
        }, 
        { 
          userId: toUserId, 
          type: 'gift_received', 
          amount, 
          balanceAfter: receiverBalance, 
          reason: 'gift_received', 
          relatedUserId: fromUserId, 
          idempotencyKey: `${baseKey}_received` 
        } 
      ], sess ? { session: sess, ordered: true } : {}) 
    } 
 
    if (session) { 
      await session.withTransaction(() => execute(session)) 
      await session.endSession() 
    } else { 
      await execute(null) 
    } 
 
    return { success: true, amount, senderBalance } 
 
  } catch (err) { 
    if (session) { try { await session.endSession() } catch {} } 
    console.error('[Coins] Gift failed:', err.message) 
    return { success: false, reason: 'transaction_failed', error: err.message } 
  } 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// ADMIN AWARD COINS (bypasses daily cap) 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function adminAwardCoins(userId, amount, adminId) { 
  await connectDB() 
 
  if (amount < 1 || amount > 10000) { 
    return { success: false, reason: 'invalid_amount' } 
  } 
 
  const updated = await Wallet.findOneAndUpdate( 
    { userId }, 
    { $inc: { balance: amount, totalEarned: amount } }, 
    { upsert: true, returnDocument: 'after' } 
  ) 
 
  if (!updated) throw new Error('Admin award failed: wallet not found/created')

  // Whale badge check 
  const prevTotal = updated.totalEarned - amount 
  if (prevTotal < 10000 && updated.totalEarned >= 10000) { 
    await awardWhaleBadge(userId).catch(err => {
        console.error('[Coins] Whale badge award failed:', err.message)
    }) 
  } 

  const adminAwardId = crypto.randomUUID?.() || Math.random().toString(36).substring(2)
  const idempotencyKey = crypto.createHash('sha256').update(`${userId}_admin_bonus_${adminId}_${adminAwardId}`).digest('hex')

  await CoinTransaction.create({ 
    userId, 
    type: 'admin_adjust', 
    amount: amount, 
    balanceAfter: updated.balance, 
    reason: 'admin_bonus', 
    relatedUserId: adminId,
    idempotencyKey
  }) 
 
  return { success: true, newBalance: updated.balance } 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// GET WALLET WITH EQUIPPED VISUALS 
// Used by profile page and wallet page 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
export async function getWalletData(userId) { 
  await connectDB() 
 
  let wallet = await Wallet.findOne({ userId })
  
  if (!wallet) {
    wallet = await getOrCreateWallet(userId)
  }

  // Admin coin logic: if user is admin, ensure they have at least 999,999 coins
  const user = await User.findById(userId).lean()
  if (user && isAdmin(user) && wallet.balance < 999999) {
    const diff = 999999 - wallet.balance
    
    // Update wallet
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId },
      { $set: { balance: 999999 }, $inc: { totalEarned: diff } },
      { returnDocument: 'after' }
    )
    
    if (updatedWallet) {
      wallet = updatedWallet
      
      // Log the adjustment
      await CoinTransaction.create({
        userId,
        type: 'admin_adjust',
        amount: diff,
        balanceAfter: 999999,
        reason: 'admin_bonus',
        idempotencyKey: `admin_auto_set_${userId}_${new Date().toISOString().split('T')[0]}`
      }).catch(err => console.error('[Coins] Admin auto-set log failed:', err.message))
    }
  }
 
  // Fetch visual data for equipped items in one query 
  const equippedSlugs = Object.values(wallet.equipped.toObject 
    ? wallet.equipped.toObject() 
    : wallet.equipped 
  ).filter(Boolean) 
 
  let equippedVisuals = {} 
  if (equippedSlugs.length > 0) { 
    const items = await ShopItem.find({ 
      slug: { $in: equippedSlugs } 
    }).select('slug category visual').lean() 
 
    equippedVisuals = items.reduce((acc, item) => { 
      acc[item.slug] = { visual: item.visual, category: item.category } 
      return acc 
    }, {}) 
  } 
 
  return { 
    balance: wallet.balance, 
    totalEarned: wallet.totalEarned, 
    totalSpent: wallet.totalSpent, 
    todayEarned: wallet.todayEarned, 
    equipped: wallet.equipped, 
    equippedVisuals, 
    inventoryCount: wallet.inventory.length 
  } 
} 
 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
// INTERNAL: Auto-award Whale badge 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 
 
async function awardWhaleBadge(userId, session = null) { 
  await connectDB() 
 
  const whaleBadge = await ShopItem.findOne({ slug: 'badge-whale' }).lean() 
  if (!whaleBadge) return 
 
  const opts = session ? { session } : {} 
 
  // Add to inventory if not already there 
  await Wallet.findOneAndUpdate( 
    { 
      userId, 
      'inventory.itemId': { $ne: whaleBadge._id } 
    }, 
    { 
      $push: { 
        inventory: { itemId: whaleBadge._id, purchasedAt: new Date() } 
      } 
    }, 
    opts 
  ) 
} 
