"use client"

import { useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share2, Type, Link as LinkIcon, Palette, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function QrGeneratorTool() {
  const [value, setValue] = useState("https://campuszen.vercel.app")
  const [size, setSize] = useState(256)
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [level, setLevel] = useState("L")
  const [includeMargin, setIncludeMargin] = useState(true)
  const qrRef = useRef(null)

  const downloadQR = (format) => {
    const svg = qrRef.current.querySelector("svg")
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    
    img.onload = () => {
      canvas.width = size
      canvas.height = size
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      const url = canvas.toDataURL(`image/${format}`)
      const link = document.createElement("a")
      link.download = `qrcode-${Date.now()}.${format}`
      link.href = url
      link.click()
      toast.success(`QR Code downloaded as ${format.toUpperCase()}`)
    }
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const shareQR = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code',
          url: value,
        })
      } else {
        navigator.clipboard.writeText(value)
        toast.success("Content link copied to clipboard")
      }
    } catch (e) {
      toast.error("Sharing failed")
    }
  }

  return (
    <ToolLayout 
      title="QR Code Generator" 
      description="Create customizable QR codes for URLs, text, and more. Export as PNG or SVG."
    >
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl border bg-card space-y-8">
            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Type className="w-4 h-4" />
                QR Content
              </Label>
              <div className="relative">
                <Input 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="h-14 pl-12 text-lg rounded-2xl border-2 focus:ring-4 transition-all"
                  placeholder="Enter URL or text..."
                />
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      Size: {size}px
                    </Label>
                  </div>
                  <Slider 
                    value={[size]} 
                    min={128} 
                    max={1024} 
                    step={8} 
                    onValueChange={([val]) => setSize(val)} 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Error Correction</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Colors
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] text-muted-foreground">Foreground</span>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={fgColor} 
                          onChange={(e) => setFgColor(e.target.value)}
                          className="h-10 p-1 w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-muted-foreground">Background</span>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={bgColor} 
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-10 p-1 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                   <input 
                    type="checkbox" 
                    id="margin" 
                    checked={includeMargin} 
                    onChange={(e) => setIncludeMargin(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                   />
                   <Label htmlFor="margin" className="text-sm cursor-pointer">Include Quiet Zone (Margin)</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-3xl border bg-card flex flex-col items-center justify-center space-y-6 min-h-[400px]">
            <div 
              ref={qrRef} 
              className="p-4 rounded-2xl bg-white shadow-xl transition-all duration-500"
              style={{ backgroundColor: bgColor }}
            >
              <QRCodeSVG 
                value={value || " "}
                size={Math.min(size, 256)}
                fgColor={fgColor}
                bgColor={bgColor}
                level={level}
                includeMargin={includeMargin}
              />
            </div>
            
            <div className="w-full space-y-3">
              <Button className="w-full h-12 rounded-xl" onClick={() => downloadQR("png")}>
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 rounded-xl" onClick={shareQR}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="h-12 rounded-xl" onClick={() => downloadQR("jpeg")}>
                  JPG
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <h4 className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">Tip</h4>
            <p className="text-[11px] text-violet-200/70 leading-relaxed">
              Higher error correction levels (Q or H) allow the QR code to remain scannable even if partially obscured or damaged, but result in a denser pattern.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
