"use client"

import { useState } from "react"
import { SassFormatter } from "sass-formatter"
import { Code2, Copy, Trash2, Layout, Maximize, Minimize, Settings2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function ScssFormatterTool() {
  const [input, setInput] = useState('.container { width: 100%; .card { background: red; display: flex; align-items: center; } }')
  const [output, setOutput] = useState("")
  const [options, setOptions] = useState({
    tabSize: 2,
    insertSpaces: true,
  })

  const formatScss = () => {
    try {
      if (!input.trim()) {
        setOutput("")
        return
      }
      
      const formatted = SassFormatter.Format(input, {
        tabSize: options.tabSize,
        insertSpaces: options.insertSpaces,
      })
      
      setOutput(formatted)
      toast.success("SCSS formatted")
    } catch (e) {
      toast.error("Formatting failed: " + e.message)
    }
  }

  const minifyScss = () => {
    try {
      if (!input.trim()) {
        setOutput("")
        return
      }
      // Simple regex-based minification for SCSS
      const minified = input
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
        .replace(/\s+/g, ' ') // collapse whitespace
        .replace(/\s*([{};:,])\s*/g, '$1') // remove spaces around symbols
        .trim()
      
      setOutput(minified)
      toast.success("SCSS minified")
    } catch (e) {
      toast.error("Minification failed")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast.success("Copied to clipboard")
  }

  return (
    <ToolLayout 
      title="SCSS Formatter & Minifier" 
      description="Beautify or minify your SCSS code. Clean up nested structures and improve readability."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                SCSS Input
              </Label>
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setInput("")}>
                <Trash2 className="w-3 h-3 mr-2" />
                Clear
              </Button>
            </div>
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm p-4 bg-card focus-visible:ring-primary"
              placeholder="Paste your SCSS here..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Formatted Output
              </Label>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard} disabled={!output}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative group">
               <Textarea 
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm p-4 bg-muted/50 border-primary/20 focus-visible:ring-primary"
                placeholder="Result will appear here..."
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
            <div className="flex items-center gap-4">
               <div className="flex items-center space-x-2">
                <Switch 
                  id="spaces" 
                  checked={options.insertSpaces} 
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, insertSpaces: checked }))} 
                />
                <Label htmlFor="spaces" className="text-sm cursor-pointer">Use Spaces</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Tab Size:</Label>
                <Select value={options.tabSize.toString()} onValueChange={(val) => setOptions(prev => ({ ...prev, tabSize: parseInt(val) }))}>
                  <SelectTrigger className="w-16 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-6 rounded-xl" onClick={minifyScss}>
              <Minimize className="w-4 h-4 mr-2" />
              Minify
            </Button>
            <Button className="h-11 px-8 rounded-xl" onClick={formatScss}>
              <Maximize className="w-4 h-4 mr-2" />
              Beautify
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-200/70 leading-relaxed">
            The SCSS Formatter automatically cleans up your stylesheets while preserving nested rules, variables, and mixins. Use <b>Beautify</b> for readability and <b>Minify</b> for production deployment.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}

// Add a simple Select component since it's used
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
