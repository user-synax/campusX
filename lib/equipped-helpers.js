import connectDB from './db.js' 
import Wallet from '../models/Wallet.js' 
import ShopItem from '../models/ShopItem.js' 
import User from '../models/User.js' 
import { getFounderVisuals } from './founder-items.js' 
 
/**
 * Batch attaches equipped visuals to a list of items (posts, records, etc.) based on author.
 * @param {Array} items - The list of items to process.
 * @param {string} authorPath - The nested path to the author object (e.g., 'author' or 'user'). 
 * Use empty string if the items themselves are the user objects.
 */
export async function attachEquippedToItems(items, authorPath = 'author') { 
  if (!items || items.length === 0) return items 
  await connectDB() 
 
  const isDirectUser = authorPath === ''

  // Collect unique author IDs 
  const authorIds = [...new Set( 
    items.map(item => { 
      if (isDirectUser) return item?._id?.toString() || item?.toString()

      const parts = authorPath.split('.') 
      let val = item 
      for (const p of parts) val = val?.[p] 
      return val?._id?.toString() || val?.toString() 
    }).filter(Boolean) 
  )] 
 
  if (authorIds.length === 0) return items 
 
  // Batch: usernames + wallets in parallel 
  const [users, wallets] = await Promise.all([ 
    User.find({ _id: { $in: authorIds } }) 
      .select('_id username').lean(), 
    Wallet.find({ userId: { $in: authorIds } }) 
      .select('userId equipped').lean() 
  ]) 
 
  const usernameMap = users.reduce((acc, u) => { 
    acc[u._id.toString()] = u.username; return acc 
  }, {}) 
 
  const walletMap = wallets.reduce((acc, w) => { 
    acc[w.userId.toString()] = w.equipped; return acc 
  }, {}) 
 
  // Collect all slugs to resolve visuals 
  const allSlugs = new Set() 
  Object.values(walletMap).forEach(equipped => { 
    if (!equipped) return 
    const e = equipped.toObject ? equipped.toObject() : equipped 
    Object.values(e).forEach(slug => { if (slug) allSlugs.add(slug) }) 
  }) 
 
  // Batch fetch shop item visuals 
  let shopVisuals = {} 
  if (allSlugs.size > 0) { 
    const shopItems = await ShopItem.find({ slug: { $in: [...allSlugs] } }) 
      .select('slug category visual').lean() 
    shopItems.forEach(si => { 
      shopVisuals[si.slug] = { ...si.visual, category: si.category } 
    }) 
  } 
 
  // Build equipped map per authorId 
  const equippedMap = {} 
  for (const authorId of authorIds) { 
    const username = usernameMap[authorId] 
 
    // Founder check first 
    const founderVisuals = getFounderVisuals(username) 
    if (founderVisuals) { 
      equippedMap[authorId] = { ...founderVisuals, isFounder: true } 
      continue 
    } 
 
    const equipped = walletMap[authorId] 
    if (!equipped) { equippedMap[authorId] = null; continue } 
 
    const e = equipped.toObject ? equipped.toObject() : equipped 
    const resolved = {} 
    for (const [slot, slug] of Object.entries(e)) { 
      if (slug && shopVisuals[slug]) { 
        resolved[slot] = { slug, ...shopVisuals[slug] } 
      } 
    } 
    equippedMap[authorId] = Object.keys(resolved).length > 0 ? resolved : null 
  } 
 
  // Attach to items 
  return items.map(item => { 
    if (isDirectUser) {
      const authorId = item?._id?.toString() || item?.toString()
      return {
        ...(item.toObject ? item.toObject() : item),
        equipped: equippedMap[authorId] || null
      }
    }

    const parts = authorPath.split('.') 
    let authorRef = item 
    for (const p of parts) authorRef = authorRef?.[p] 
    const authorId = authorRef?._id?.toString() || authorRef?.toString() 
    if (!authorId) return item 
 
    // Attach equipped to the author object 
    const authorKey = parts[0] 
    const updatedAuthor = {
      ...(item[authorKey]?.toObject ? item[authorKey].toObject() : item[authorKey]),
      equipped: equippedMap[authorId] || null
    }

    return { 
      ...(item.toObject ? item.toObject() : item), 
      [authorKey]: updatedAuthor
    } 
  }) 
} 
