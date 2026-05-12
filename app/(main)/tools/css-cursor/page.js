"use client"

import { useState } from "react"
import { MousePointer2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

const CURSORS = [
  "auto", "default", "none", "context-menu", "help", "pointer", "progress", "wait", 
  "cell", "crosshair", "text", "vertical-text", "alias", "copy", "move", "no-drop", 
  "not-allowed", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", 
  "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", 
  "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", 
  "zoom-in", "zoom-out"
]

export default function CssCursorTool() {
  const [selected, setSelected] = useState("pointer")
  const [copied, setCopied] = useState(false)

  const copyCss = (cursor) => {
    navigator.clipboard.writeText(`cursor: ${cursor};`)
    setCopied(cursor)
    toast.success(`Copied cursor: ${cursor}`)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ToolLayout 
      title="CSS Cursor Viewer" 
      description="Preview and copy CSS cursor styles. Hover over the cards to see the cursor in action."
    >
      <div className="space-y-8">
        <div className="p-12 rounded-2xl border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center text-center transition-all duration-300 group" style={{ cursor: selected }}>
          <div className="p-6 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
            <MousePointer2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">{selected}</h2>
          <p className="text-muted-foreground">Hover here to test the <span className="font-bold text-foreground">{selected}</span> cursor</p>
          <div className="mt-6">
            <Button onClick={() => copyCss(selected)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy CSS
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CURSORS.map(cursor => (
            <button
              key={cursor}
              className={`p-4 rounded-xl border text-center transition-all hover:border-primary hover:shadow-lg ${
                selected === cursor ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"
              }`}
              style={{ cursor }}
              onClick={() => setSelected(cursor)}
            >
              <p className="text-xs font-bold truncate">{cursor}</p>
              {selected === cursor && copied === cursor ? (
                <Check className="w-3 h-3 mx-auto mt-2 text-primary-foreground" />
              ) : (
                <div className="h-3 mt-2" />
              )}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
