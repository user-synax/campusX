"use client" 
 
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins } from "lucide-react"
import ItemPreview from "./ItemPreview"
import { cn } from "@/lib/utils"

/**
 * Individual item card for the shop grid.
 */
export default function ShopItemCard({ item, balance, rarityConfig, onBuy }) { 
  const isAffordable = balance >= item.price
  const rarity = rarityConfig[item.rarity] || rarityConfig.common

  return ( 
    <Card className={cn(
      "overflow-hidden flex flex-col h-full border-border/50 hover:border-border transition-all duration-300",
      item.isOwned && "opacity-75 grayscale-[0.5]"
    )}> 
      {/* Rarity top bar */} 
      <div className={cn(
        "h-1 w-full",
        item.rarity === 'legendary' ? 'bg-linear-to-r from-amber-400 to-yellow-300' : 
        item.rarity === 'mythic'    ? 'bg-linear-to-r from-red-600 to-orange-500' :
        item.rarity === 'epic'      ? 'bg-linear-to-r from-purple-500 to-pink-500' : 
        item.rarity === 'rare'      ? 'bg-blue-500' : 'bg-muted' 
      )} /> 
 
      <div className="p-3 flex flex-col flex-1 gap-2.5"> 
        {/* Preview Container */} 
        <div className="aspect-square bg-accent/30 rounded-xl flex items-center justify-center min-h-[100px] overflow-hidden"> 
          <ItemPreview item={item} /> 
        </div> 
 
        {/* Info Section */} 
        <div className="space-y-1"> 
          <div className="flex items-start justify-between gap-2"> 
            <p className="font-bold text-sm leading-tight line-clamp-1">{item.name}</p> 
            <span className={cn(
              "text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full border shrink-0",
              rarity.className
            )}> 
              {rarity.label} 
            </span> 
          </div> 
          <p className="text-[11px] text-muted-foreground line-clamp-2 min-h-[2rem]"> 
            {item.description} 
          </p> 
        </div> 
 
        {/* Limited Stock Info */} 
        {item.isLimited && ( 
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md self-start">
            <span className="animate-pulse">⏳</span>
            <span>
              {item.maxStock 
                ? `${Math.max(0, item.maxStock - (item.soldCount || 0))} remaining` 
                : 'Limited time' 
              } 
            </span>
          </div>
        )} 
 
        {/* Footer: Price + Action */} 
        <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between"> 
          <div className="flex items-center gap-1"> 
            <Coins className="w-4 h-4 text-amber-500" /> 
            <span className={cn(
              "font-black text-sm",
              item.price === 0 ? 'text-green-500' : 
              !isAffordable && !item.isOwned ? 'text-muted-foreground' : 'text-amber-500' 
            )}> 
              {item.price === 0 ? 'FREE' : item.price} 
            </span> 
          </div> 
 
          {item.isOwned ? ( 
            <Button size="sm" variant="ghost" disabled className="h-7 text-[10px] font-bold text-green-500 uppercase tracking-wider">
              ✓ Owned
            </Button>
          ) : item.maxStock !== null && (item.soldCount || 0) >= item.maxStock ? ( 
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Sold out</span> 
          ) : ( 
            <Button 
              size="sm" 
              className="h-7 text-[10px] font-bold px-3 uppercase tracking-wider" 
              disabled={!isAffordable} 
              onClick={onBuy} 
            > 
              {item.price === 0 ? 'Claim' : 'Buy'} 
            </Button> 
          )} 
        </div> 
      </div> 
    </Card> 
  ) 
} 
