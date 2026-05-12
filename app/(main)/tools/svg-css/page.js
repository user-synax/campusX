"use client"

import { useState, useEffect } from "react"
import { Image as ImageIcon, Copy, Trash2, Code2, Paintbrush, Info, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function SvgCssTool() {
  const [svg, setSvg] = useState('<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" stroke="#6366f1" stroke-width="8" fill="#a855f7" fill-opacity="0.2" />\n</svg>')
  const [output, setOutput] = useState("")
  const [options, setOptions] = useState({
    useMask: false,
    optimize: true,
  })

  const convertSvgToCss = (svgText) => {
    try {
      if (!svgText.trim()) {
        setOutput("")
        return
      }

      let optimized = svgText
        .replace(/\n/g, "")
        .replace(/"/g, "'")
        .replace(/>\s+</g, "><")
        .trim()

      if (options.optimize) {
        // Basic optimization: remove comments and redundant namespaces
        optimized = optimized.replace(/<!--[\s\S]*?-->/g, "")
      }

      const encoded = encodeURIComponent(optimized)
        .replace(/%20/g, " ")
        .replace(/%3D/g, "=")
        .replace(/%3A/g, ":")
        .replace(/%2F/g, "/")
        .replace(/%27/g, "'")

      const dataUri = `data:image/svg+xml,${encoded}`
      
      let css = ""
      if (options.useMask) {
        css = `.icon {\n  width: 24px;\n  height: 24px;\n  background-color: currentColor;\n  mask-image: url("${dataUri}");\n  -webkit-mask-image: url("${dataUri}");\n  mask-repeat: no-repeat;\n  mask-size: contain;\n}`
      } else {
        css = `.element {\n  background-image: url("${dataUri}");\n  background-repeat: no-repeat;\n  background-size: contain;\n}`
      }

      setOutput(css)
    } catch (e) {
      toast.error("SVG conversion failed")
    }
  }

  useEffect(() => {
    convertSvgToCss(svg)
  }, [svg, options])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast.success("CSS copied to clipboard")
  }

  return (
    <ToolLayout 
      title="SVG ⇄ CSS Converter" 
      description="Convert SVG code into CSS background-image or mask-image properties. Fast, optimized, and ready for your stylesheets."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                SVG Source
              </Label>
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setSvg("")}>
                <Trash2 className="w-3 h-3 mr-2" />
                Clear
              </Button>
            </div>
            <Textarea 
              value={svg}
              onChange={(e) => setSvg(e.target.value)}
              className="min-h-[350px] font-mono text-sm p-4 bg-card focus-visible:ring-primary"
              placeholder="Paste your <svg> code here..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Paintbrush className="w-4 h-4" />
                CSS Output
              </Label>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard} disabled={!output}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative group">
               <Textarea 
                value={output}
                readOnly
                className="min-h-[350px] font-mono text-xs p-4 bg-muted/50 border-primary/20 focus-visible:ring-primary"
                placeholder="Resulting CSS will appear here..."
              />
              {output && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" onClick={copyToClipboard}>
                    <Copy className="w-3 h-3 mr-2" />
                    Copy
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center space-x-2">
              <Switch 
                id="mask" 
                checked={options.useMask} 
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, useMask: checked }))} 
              />
              <Label htmlFor="mask" className="text-sm cursor-pointer">Use as Mask (Allows coloring via <code>color</code>)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="opt" 
                checked={options.optimize} 
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, optimize: checked }))} 
              />
              <Label htmlFor="opt" className="text-sm cursor-pointer">Basic Optimization</Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Preview</h3>
              <div className="p-8 rounded-3xl border bg-card flex items-center justify-center min-h-[200px] relative overflow-hidden">
                 {/* Checkerboard background */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
                 <div 
                  className="w-32 h-32 relative z-10"
                  style={{
                    backgroundColor: options.useMask ? 'currentColor' : 'transparent',
                    backgroundImage: options.useMask ? 'none' : `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/"/g, "'")).replace(/%20/g, ' ')}")`,
                    maskImage: options.useMask ? `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/"/g, "'")).replace(/%20/g, ' ')}")` : 'none',
                    WebkitMaskImage: options.useMask ? `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/"/g, "'")).replace(/%20/g, ' ')}")` : 'none',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskSize: 'contain',
                  }}
                 />
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Why use this?
              </h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl border bg-card/50 space-y-2">
                    <p className="text-xs font-bold text-primary">Performance</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Inline SVG in CSS reduces HTTP requests and keeps your assets bundled with your styles.</p>
                 </div>
                 <div className="p-4 rounded-xl border bg-card/50 space-y-2">
                    <p className="text-xs font-bold text-primary">Flexibility</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Masking allows you to change the color of your SVG icons using the standard CSS <code>color</code> or <code>background-color</code> properties.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  )
}
