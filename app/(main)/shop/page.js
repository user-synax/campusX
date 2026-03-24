"use client"

import { useState, useEffect } from 'react'
import { ShoppingBag, Loader2, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ShopItemCard from "@/components/coins/ShopItemCard"
import ItemPreview from "@/components/coins/ItemPreview"

const CATEGORY_TABS = [ 
  { id: 'all',            label: 'All',      emoji: '🛍️' }, 
  { id: 'avatar_frame',   label: 'Frames',   emoji: '🖼️' }, 
  { id: 'username_color', label: 'Names',    emoji: '✨' }, 
  { id: 'profile_banner', label: 'Banners',  emoji: '🎨' }, 
  { id: 'profile_theme',  label: 'Themes',   emoji: '🌌' },
  { id: 'post_badge',     label: 'Badges',   emoji: '🏷️' }, 
  { id: 'chat_bubble',    label: 'Chat',     emoji: '💬' }, 
  { id: 'bio_theme',      label: 'Bio',      emoji: '📝' },
  { id: 'effect',         label: 'Effects',  emoji: '🫧' },
  { id: 'special_badge',  label: 'Special',  emoji: '⭐' },
  { id: 'entry_effect',   label: 'Entry',    emoji: '🚀' }
] 
 
const RARITY = { 
  common:    { label: 'Common',    className: 'text-muted-foreground border-border bg-transparent' }, 
  uncommon:  { label: 'Uncommon',  className: 'text-green-400 border-green-500/30 bg-green-500/10' },
  rare:      { label: 'Rare',      className: 'text-blue-400 border-blue-500/30 bg-blue-500/10' }, 
  epic:      { label: 'Epic',      className: 'text-purple-400 border-purple-500/30 bg-purple-500/10' }, 
  legendary: { label: 'Legendary', className: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  mythic:    { label: 'Mythic',    className: 'text-red-500 border-red-500/30 bg-red-500/10' }
}

export default function ShopPage() {
  const [items, setItems] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [purchaseItem, setPurchaseItem] = useState(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, shopRes] = await Promise.all([
          fetch('/api/coins/wallet'),
          fetch('/api/coins/shop')
        ])
        const [walletData, shopData] = await Promise.all([
          walletRes.json(),
          shopRes.json()
        ])
        
        setBalance(walletData.balance || 0)
        setItems(shopData.items || [])
      } catch (error) {
        console.error('Failed to fetch shop data:', error)
        toast.error('Failed to load shop')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredItems = items.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  )

  const handlePurchase = async () => {
    if (!purchaseItem) return
    setPurchasing(true)
    try {
      const res = await fetch('/api/coins/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemSlug: purchaseItem.slug })
      })
      const data = await res.json()

      if (res.ok) {
        setBalance(data.newBalance)
        setItems(prev => prev.map(i => i.slug === purchaseItem.slug ? { ...i, isOwned: true } : i))
        toast.success(`Successfully purchased ${purchaseItem.name}!`)
        setPurchaseItem(null)
      } else {
        const errorMessage = data.error === 'insufficient_balance' 
          ? `Insufficient balance. Need ${data.details.shortfall} more coins.`
          : data.error === 'already_owned'
          ? 'You already own this item.'
          : data.error === 'item_not_found'
          ? 'Item no longer available.'
          : data.error === 'out_of_stock'
          ? 'Item is out of stock.'
          : data.error || 'Purchase failed'
        
        toast.error(errorMessage)
      }
    } catch (error) {
      toast.error('Connection error')
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-border z-20">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Shop
            </h1>
            <p className="text-xs text-muted-foreground">Customize your CampusX profile</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 shadow-sm">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="font-black text-amber-500">{balance}</span>
          </div>
        </div>

        {/* Category scroll tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
          {CATEGORY_TABS.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveCategory(tab.id)} 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border flex-shrink-0 transition-all duration-200
                ${activeCategory === tab.id 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                  : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground' 
                }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Entering the shop...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">No items found</h3>
            <p className="text-sm text-muted-foreground">Check back later for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <ShopItemCard 
                key={item._id} 
                item={item} 
                balance={balance} 
                rarityConfig={RARITY} 
                onBuy={() => setPurchaseItem(item)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Purchase confirm dialog */}
      <Dialog open={!!purchaseItem} onOpenChange={(open) => !open && setPurchaseItem(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to buy this item?
            </DialogDescription>
          </DialogHeader>
          
          {purchaseItem && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-24 h-24 bg-accent/30 rounded-2xl flex items-center justify-center overflow-hidden border border-border/50">
                <ItemPreview item={purchaseItem} />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-lg">{purchaseItem.name}</h4>
                <p className="text-sm text-muted-foreground">{purchaseItem.description}</p>
              </div>
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-xl">
                <span className="text-sm text-muted-foreground font-medium">Cost:</span>
                <span className="font-black text-amber-500 flex items-center gap-1">
                  <Coins className="w-4 h-4" /> {purchaseItem.price}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                Your balance after: <span className="font-bold flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" /> {balance - purchaseItem.price}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setPurchaseItem(null)} disabled={purchasing}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handlePurchase} 
              disabled={purchasing || (purchaseItem && balance < purchaseItem.price)}
            >
              {purchasing ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
              ) : balance < (purchaseItem?.price || 0) ? (
                'Insufficient Coins'
              ) : (
                'Confirm & Buy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
