"use client"

import { useState, useCallback } from "react"
import { Upload, File, Copy, Trash2, FileCode, ImageIcon, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function DataUrlTool() {
  const [fileInfo, setFileInfo] = useState(null)
  const [dataUrl, setDataUrl] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setDataUrl(e.target.result)
      setFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        type: file.type || "unknown",
      })
      toast.success("File encoded to Data URL")
    }
    reader.onerror = () => {
      toast.error("Failed to read file")
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const copyToClipboard = (type) => {
    let text = dataUrl
    if (type === "css") {
      text = `background-image: url("${dataUrl}");`
    } else if (type === "html") {
      text = `<img src="${dataUrl}" alt="" />`
    }
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const clear = () => {
    setDataUrl("")
    setFileInfo(null)
  }

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <ToolLayout 
      title="Data URL Generator" 
      description="Convert any file into a base64 encoded Data URL for use in HTML, CSS, or JSON."
    >
      <div className="space-y-8">
        {!dataUrl ? (
          <div 
            className={`relative h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${
              isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20 bg-card hover:bg-muted/30"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={(e) => processFile(e.target.files[0])}
            />
            <div className="flex flex-col items-center gap-4 text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Click or drag file to upload</h3>
                <p className="text-sm text-muted-foreground">Support for images, fonts, icons, and small assets.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl border bg-card space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Data URL Output
                  </Label>
                  <Button variant="outline" size="sm" onClick={clear} className="h-8">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Clear
                  </Button>
                </div>
                <Textarea 
                  value={dataUrl}
                  readOnly
                  className="min-h-[300px] font-mono text-[10px] p-4 bg-muted/50 focus-visible:ring-primary break-all"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button onClick={() => copyToClipboard("raw")} className="h-11 rounded-xl">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Data URL
                  </Button>
                  <Button variant="outline" onClick={() => copyToClipboard("css")} className="h-11 rounded-xl">
                    Copy for CSS
                  </Button>
                  <Button variant="outline" onClick={() => copyToClipboard("html")} className="h-11 rounded-xl">
                    Copy for HTML
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl border bg-card space-y-6">
                <h3 className="font-bold flex items-center gap-2">
                  <File className="w-4 h-4" />
                  File Info
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm font-medium truncate max-w-[150px]">{fileInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="text-sm font-medium">{fileInfo.size}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="text-sm font-medium">{fileInfo.type}</span>
                  </div>
                </div>
                
                {fileInfo.type.startsWith("image/") && (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Preview</Label>
                    <div className="relative aspect-square rounded-xl overflow-hidden border bg-muted/30 flex items-center justify-center p-4">
                       <img src={dataUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                  Data URLs are great for small assets but can increase bundle size if overused. Consider using them for icons or small decorative images.
                </p>
              </div>
            </div>
          </div>
        )}

        {!dataUrl && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-2xl border bg-card/50 flex flex-col items-center text-center gap-3">
              <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
              <h4 className="font-bold text-sm">Images</h4>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP, SVG</p>
            </div>
            <div className="p-6 rounded-2xl border bg-card/50 flex flex-col items-center text-center gap-3">
              <FileCode className="w-8 h-8 text-muted-foreground opacity-50" />
              <h4 className="font-bold text-sm">Fonts</h4>
              <p className="text-xs text-muted-foreground">WOFF, WOFF2, TTF, OTF</p>
            </div>
            <div className="p-6 rounded-2xl border bg-card/50 flex flex-col items-center text-center gap-3">
              <File className="w-8 h-8 text-muted-foreground opacity-50" />
              <h4 className="font-bold text-sm">Other</h4>
              <p className="text-xs text-muted-foreground">PDF, JSON, XML, etc.</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
