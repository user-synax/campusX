"use client" 
 
import { BellOff, X } from 'lucide-react' 
 
export default function PushDeniedBanner({ onDismiss }) { 
  return ( 
    <div className=" 
      mx-4 mt-4 mb-2 
      bg-amber-500/10 border border-amber-500/20 
      rounded-xl p-4 
    "> 
      <div className="flex items-start gap-3"> 
        <BellOff className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" /> 
        <div className="flex-1"> 
          <p className="font-semibold text-sm text-amber-300"> 
            Notifications blocked 
          </p> 
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed"> 
            To re-enable: click the 🔒 lock icon in your browser&apos;s
            address bar → Notifications → Allow. 
            Then refresh this page. 
          </p> 
        </div> 
        <button onClick={onDismiss}> 
          <X className="w-4 h-4 text-muted-foreground" /> 
        </button> 
      </div> 
    </div> 
  ) 
} 
