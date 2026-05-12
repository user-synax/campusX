"use client"

import { useState } from "react"
import { Scaling, Monitor, Tablet, Smartphone, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import ToolLayout from "@/components/tools/ToolLayout"

export default function ResponsiveFontTool() {
  const [baseSize, setBaseSize] = useState(16)
  const [scale, setScale] = useState(1.25)
  const [viewportWidth, setViewportWidth] = useState(1200)

  const SIZES = [
    { label: "Display 1", level: "text-6xl" },
    { label: "Heading 1", level: "text-4xl" },
    { label: "Heading 2", level: "text-3xl" },
    { label: "Heading 3", level: "text-2xl" },
    { label: "Heading 4", level: "text-xl" },
    { label: "Base Body", level: "text-base" },
    { label: "Small text", level: "text-sm" },
    { label: "Caption", level: "text-xs" }
  ]

  const getCalculatedSize = (index) => {
    // index 5 is base body (16px default)
    const power = 5 - index
    return Math.round(baseSize * Math.pow(scale, power))
  }

  return (
    <ToolLayout 
      title="Responsive Font Checker" 
      description="Preview and test font scaling and typography across different viewports and scales."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Base Font Size (px)</Label>
              <div className="flex gap-4 items-center">
                <Slider 
                  value={[baseSize]} 
                  min={10} 
                  max={24} 
                  step={1} 
                  onValueChange={(val) => setBaseSize(val[0])}
                  className="flex-1"
                />
                <span className="font-mono font-bold w-12 text-right">{baseSize}px</span>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Type Scale Ratio</Label>
              <div className="flex gap-4 items-center">
                <Slider 
                  value={[scale]} 
                  min={1.0} 
                  max={1.6} 
                  step={0.01} 
                  onValueChange={(val) => setScale(val[0])}
                  className="flex-1"
                />
                <span className="font-mono font-bold w-12 text-right">{scale.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Minor Second", val: 1.067 },
                  { label: "Major Second", val: 1.125 },
                  { label: "Perfect Fourth", val: 1.333 },
                  { label: "Golden Ratio", val: 1.618 }
                ].map(r => (
                  <Button 
                    key={r.label} 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7"
                    onClick={() => setScale(r.val)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Viewport Simulation</Label>
              <div className="flex gap-2">
                <Button 
                  variant={viewportWidth >= 1024 ? "default" : "outline"} 
                  className="flex-1" 
                  onClick={() => setViewportWidth(1200)}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Desktop
                </Button>
                <Button 
                  variant={viewportWidth >= 768 && viewportWidth < 1024 ? "default" : "outline"} 
                  className="flex-1" 
                  onClick={() => setViewportWidth(768)}
                >
                  <Tablet className="w-4 h-4 mr-2" />
                  Tablet
                </Button>
                <Button 
                  variant={viewportWidth < 768 ? "default" : "outline"} 
                  className="flex-1" 
                  onClick={() => setViewportWidth(375)}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-muted/20 rounded-2xl border overflow-hidden flex flex-col">
            <div className="bg-muted/50 p-2 border-b flex items-center justify-between px-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/30" />
                <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
              </div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Preview: {viewportWidth}px width
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto max-h-[600px] space-y-8" style={{ width: "100%", maxWidth: `${viewportWidth}px`, margin: "0 auto" }}>
              {SIZES.map((size, index) => {
                const calculatedSize = getCalculatedSize(index)
                return (
                  <div key={size.label} className="space-y-1">
                    <div className="flex justify-between items-baseline border-b border-border/50 pb-1 mb-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{size.label}</span>
                      <span className="text-[10px] font-mono text-primary font-bold">{calculatedSize}px / {(calculatedSize/16).toFixed(3)}rem</span>
                    </div>
                    <p style={{ fontSize: `${calculatedSize}px`, lineHeight: 1.2 }}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3 text-sm">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-primary">Typography Tip</p>
            <p className="text-muted-foreground">Using a consistent type scale helps create visual hierarchy and harmony in your designs. A scale of 1.250 (Major Third) is a safe and popular choice for web applications.</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
