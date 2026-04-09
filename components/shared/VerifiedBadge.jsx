import { ShieldCheck, CheckCircle2 } from "lucide-react"

export default function VerifiedBadge({ 
  size = "sm", 
  showText = false, 
  verificationType = "id_card",
  className = ""
}) {
  // Config mapping based on sizes
  const config = {
    sm: {
      iconSize: "w-3.5 h-3.5",
      textSize: "text-[10px]",
      containerSize: "gap-1",
      icon: CheckCircle2
    },
    md: {
      iconSize: "w-[18px] h-[18px]",
      textSize: "text-xs",
      containerSize: "gap-1.5",
      icon: ShieldCheck
    },
    lg: {
      iconSize: "w-[22px] h-[22px]",
      textSize: "text-sm font-semibold",
      containerSize: "gap-2",
      icon: ShieldCheck
    }
  }

  const { iconSize, textSize, containerSize, icon: Icon } = config[size] || config.sm

  // Tooltip/title configuration
  const titleText = verificationType === "college_email" 
    ? "Verified via College Email 🎓"
    : "Verified Student 🎓"

  return (
    <div 
      className={`inline-flex items-center text-green-500 ${containerSize} ${className}`}
      title={titleText}
    >
      <Icon className={`${iconSize} flex-shrink-0`} />
      {showText && (
        <span className={textSize}>Verified</span>
      )}
    </div>
  )
}
