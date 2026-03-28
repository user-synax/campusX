"use client"

import { useState, useEffect } from 'react'
import { 
  Wallet as WalletIcon, 
  History, 
  Gift, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  CheckCircle2,
  Info,
  Coins
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import ItemPreview from "@/components/coins/ItemPreview"
import { format } from 'date-fns'
import { cn } from "@/lib/utils"
import useUser from '@/hooks/useUser'
import { isFounder } from '@/lib/founder'

const COIN_VALUES = { 
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
 
const DAILY_CAP = 200

export default function WalletPage() {
  const { user: currentUser } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [inventory, setInventory] = useState([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  
  // Gift state
  const [giftTo, setGiftTo] = useState('')
  const [giftAmount, setGiftAmount] = useState('')
  const [gifting, setGifting] = useState(false)

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/coins/wallet')
      const data = await res.json()
      setWallet(data)
    } catch (error) {
      toast.error('Failed to load wallet')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/coins/history')
      const data = await res.json()
      setHistory(data.transactions || [])
    } catch (error) {
      toast.error('Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const fetchInventory = async () => {
    setInventoryLoading(true)
    try {
      const res = await fetch('/api/coins/wallet?inventory=true')
      const data = await res.json()
      setInventory(data.inventory || [])
    } catch (error) {
      toast.error('Failed to load inventory')
    } finally {
      setInventoryLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history') fetchHistory()
    if (activeTab === 'inventory') fetchInventory()
  }, [activeTab])

  const handleEquip = async (itemSlug, slot, isEquipped) => {
    try {
      const res = await fetch('/api/coins/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemSlug, 
          slot, 
          action: isEquipped ? 'unequip' : 'equip' 
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(isEquipped ? 'Item unequipped' : 'Item equipped!')
        fetchWallet() // Refresh equipped state
      } else {
        toast.error(data.error || 'Failed to update equipment')
      }
    } catch (error) {
      toast.error('Connection error')
    }
  }

  const handleGift = async () => {
    if (!giftTo || !giftAmount) return
    setGifting(true)
    try {
      const res = await fetch('/api/coins/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: giftTo, amount: giftAmount })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Gifted ${giftAmount} coins to ${giftTo}!`)
        setGiftTo('')
        setGiftAmount('')
        fetchWallet()
      } else {
        toast.error(data.error || 'Gifting failed')
      }
    } catch (error) {
      toast.error('Connection error')
    } finally {
      setGifting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Opening your wallet...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-amber-500" /> Wallet
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid grid-cols-4 w-full bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg text-xs font-bold">Overview</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg text-xs font-bold">Items</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-xs font-bold">History</TabsTrigger>
            <TabsTrigger value="gift" className="rounded-lg text-xs font-bold">Gift</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="m-0 focus-visible:outline-none">
            <div className="p-4 space-y-6">
              {isFounder(currentUser?.username) && ( 
                <div className="bg-linear-to-br from-amber-500/20 to-purple-500/10 
                                border border-amber-500/20 rounded-2xl p-6 text-center shadow-lg mb-6"> 
                  <p className="text-4xl mb-3 animate-bounce">⚡</p> 
                  <p className="font-black text-xl tracking-tight">Founder Account</p> 
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed"> 
                    Your customizations are exclusive and permanent. 
                    No coins needed — ever. 
                  </p> 
                </div> 
              )}

              {/* Balance Card */}
              <div className="bg-linear-to-br from-amber-500/20 to-orange-500/5 border border-amber-500/20 rounded-2xl p-8 text-center shadow-sm"> 
                <p className="text-sm text-muted-foreground font-medium mb-2">Current Balance</p> 
                <div className="flex items-center justify-center gap-3 mb-4"> 
                  <Coins className="w-10 h-10 text-amber-500 animate-bounce" /> 
                  <span className="text-6xl font-black text-amber-500 tracking-tighter">
                    {wallet?.balance || 0}
                  </span> 
                </div> 
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                    {wallet?.totalEarned || 0} earned lifetime
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Link href="/shop" className="flex-1 max-w-[140px]">
                      <Button size="sm" className="w-full rounded-full font-bold shadow-lg shadow-amber-500/20">
                        🛍️ Shop
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 max-w-[140px] rounded-full font-bold border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => setActiveTab('gift')}
                    >
                      🎁 Gift
                    </Button>
                  </div>
                </div>
              </div> 

              {/* Today's Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    Today&apos;s Earnings
                  </h3>
                  <span className="text-[11px] font-black text-amber-600">
                    {wallet?.todayEarned || 0} / {DAILY_CAP}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/50 p-0.5"> 
                  <div 
                    className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(100, ((wallet?.todayEarned || 0) / DAILY_CAP) * 100)}%` }} 
                  /> 
                </div>
                <p className="text-[10px] text-muted-foreground text-center italic">
                  Daily earning limit resets every midnight
                </p>
              </div>

              {/* How to earn */}
              <Card className="border-border/50 bg-accent/5 overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-accent/10">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" /> How to earn coins
                  </h3>
                </div>
                <div className="p-4 space-y-2.5"> 
                  {Object.entries(COIN_VALUES).map(([action, coins]) => ( 
                    <div key={action} className="flex justify-between items-center text-xs group"> 
                      <span className="text-muted-foreground capitalize font-medium group-hover:text-foreground transition-colors"> 
                        {action.replace(/_/g, ' ')} 
                      </span> 
                      <span className="text-amber-600 font-black bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        +{coins} <Coins className="w-3 h-3" />
                      </span> 
                    </div> 
                  ))} 
                </div> 
              </Card>
            </div>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory" className="m-0 focus-visible:outline-none">
            <div className="p-4 space-y-4">
              {inventoryLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">Inventory is empty</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px] mt-1">
                      Head to the shop to customize your profile!
                    </p>
                  </div>
                  <Link href="/shop">
                    <Button size="sm" variant="outline" className="rounded-full font-bold">
                      🛍️ Visit Shop
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {inventory.map(item => {
                    // Fix slot mapping for avatar_frame -> avatarFrame
                    const mappedSlot = item.category === 'avatar_frame' ? 'avatarFrame' :
                                     item.category === 'username_color' ? 'usernameColor' :
                                     item.category === 'profile_banner' ? 'profileBanner' :
                                     item.category === 'post_badge' ? 'postBadge' :
                                     item.category === 'chat_bubble' ? 'chatBubble' :
                                     item.category === 'special_badge' ? 'postBadge' : 'postBadge'

                    const isEquipped = wallet?.equipped?.[mappedSlot]?.slug === item.slug

                    return (
                      <Card key={item.slug} className="p-3 border-border/50 hover:border-border transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-accent/30 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                            <ItemPreview item={item} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{item.name}</h4>
                            <p className="text-[11px] text-muted-foreground capitalize">{item.category.replace(/_/g, ' ')}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant={isEquipped ? "destructive" : "default"}
                            className={cn(
                              "h-8 text-[10px] font-bold uppercase tracking-wider px-4 rounded-full",
                              !isEquipped && "bg-primary hover:bg-primary/90"
                            )}
                            onClick={() => handleEquip(item.slug, mappedSlot, isEquipped)}
                          >
                            {isEquipped ? 'Unequip' : 'Equip'}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history" className="m-0 focus-visible:outline-none">
            <div className="p-4 space-y-3">
              {historyLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                  <History className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No transactions yet</p>
                </div>
              ) : (
                history.map(tx => {
                  const isEarn = ['earn', 'admin_adjust', 'gift_received'].includes(tx.type)
                  return (
                    <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          isEarn ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {isEarn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold capitalize">{tx.reason.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(tx.createdAt), 'MMM d, h:mm a')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-black",
                          isEarn ? "text-green-500" : "text-red-500"
                        )}>
                          {isEarn ? '+' : '-'}{tx.amount}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-0.5 justify-end">
                          <Coins className="w-2.5 h-2.5" /> {tx.balanceAfter}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* GIFT TAB */}
          <TabsContent value="gift" className="m-0 focus-visible:outline-none">
            <div className="p-4 space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center shadow-sm"> 
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-amber-600" /> 
                </div>
                <h3 className="font-black text-lg text-amber-700">Gift Coins</h3> 
                <p className="text-xs text-muted-foreground mt-1 font-medium"> 
                  Surprise a friend with Campus Coins!
                </p> 
                <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
                  {isFounder(currentUser?.username) ? (
                    <span>No Sending Limits</span>
                  ) : (
                    <>
                      <span>Min 10</span>
                      <span className="opacity-30">•</span>
                      <span>Max 1000</span>
                    </>
                  )}
                </div>
              </div> 
 
              <div className="space-y-4"> 
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recipient</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                    <Input 
                      placeholder="username" 
                      className="pl-7 rounded-xl font-bold border-border/50 focus:border-primary"
                      value={giftTo} 
                      onChange={(e) => setGiftTo(e.target.value)} 
                    /> 
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                    <Input 
                      type="number" 
                      placeholder="0" 
                      className="pl-10 rounded-xl font-black text-lg border-border/50 focus:border-amber-500"
                      min={isFounder(currentUser?.username) ? 1 : 10} 
                      max={isFounder(currentUser?.username) ? undefined : 1000} 
                      value={giftAmount} 
                      onChange={(e) => setGiftAmount(e.target.value)} 
                    /> 
                  </div>
                </div>
              </div> 
 
              {giftTo && giftAmount && Number(giftAmount) >= (isFounder(currentUser?.username) ? 1 : 10) && ( 
                <div className="bg-accent/30 border border-border/50 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200"> 
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Transfer Summary</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">
                    Sending <strong className="text-amber-600 font-black text-base flex items-center gap-1 inline-flex">{giftAmount} <Coins className="w-4 h-4" /></strong> to 
                    <strong className="text-primary font-black text-base"> @{giftTo.replace('@', '')}</strong> 
                  </p>
                  <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Balance After</span>
                    <span className="text-sm font-black flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-500" /> {(wallet?.balance || 0) - Number(giftAmount || 0)}
                    </span>
                  </div>
                </div> 
              )} 
 
              <Button 
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20" 
                disabled={ 
                  !giftTo || !giftAmount || 
                  Number(giftAmount) < (isFounder(currentUser?.username) ? 1 : 10) || 
                  (!isFounder(currentUser?.username) && Number(giftAmount) > 1000) ||
                  Number(giftAmount) > (wallet?.balance || 0) || 
                  gifting 
                } 
                onClick={handleGift} 
              > 
                {gifting 
                  ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processing...</> 
                  : <><Gift className="w-5 h-5 mr-2" /> Send Gift</> 
                } 
              </Button> 
            </div>
          </TabsContent>
        </div>
        </Tabs>
    </div>
  )
}
