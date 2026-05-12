"use client"

import { useState, useEffect } from "react"
import { Link2, Copy, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function SlugTool() {
  const [input, setInput] = useState("Hello World! This is a Test.")
  const [slug, setSlug] = useState("")
  const [separator, setSeparator] = useState("-")
  const [lowercase, setLowercase] = useState(true)
  const [removeStopWords, setRemoveStopWords] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateSlug = () => {
    let text = input.trim()
    
    if (lowercase) {
      text = text.toLowerCase()
    }

    if (removeStopWords) {
      const stopWords = ["a", "an", "the", "and", "or", "but", "is", "if", "then", "else", "when", "at", "from", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once"]
      text = text.split(/\s+/).filter(word => !stopWords.includes(word.toLowerCase())).join(" ")
    }

    // Replace special characters with space
    text = text.replace(/[^\w\s-]/g, "")
    
    // Replace spaces and multiple separators with single separator
    text = text.replace(/[\s_-]+/g, separator)
    
    // Remove leading/trailing separator
    text = text.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), "")

    setSlug(text)
  }

  useEffect(() => {
    generateSlug()
  }, [input, separator, lowercase, removeStopWords])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slug)
    setCopied(true)
    toast.success("Slug copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout 
      title="Slug Generator" 
      description="Convert any text into a clean, URL-friendly slug. Perfect for SEO-friendly URLs."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Input Text</Label>
            <Textarea 
              placeholder="Enter text to convert..." 
              className="h-32 text-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Separator</Label>
              <Input 
                value={separator} 
                onChange={(e) => setSeparator(e.target.value.substring(0, 1))} 
                maxLength={1}
              />
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
              <input 
                type="checkbox" 
                id="lowercase" 
                checked={lowercase} 
                onChange={(e) => setLowercase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="lowercase" className="cursor-pointer text-sm">Force Lowercase</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
              <input 
                type="checkbox" 
                id="stopwords" 
                checked={removeStopWords} 
                onChange={(e) => setRemoveStopWords(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="stopwords" className="cursor-pointer text-sm">Remove Stop Words</Label>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-bold">Generated Slug</Label>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy
            </Button>
          </div>
          <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center text-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-primary break-all">
              {slug || "..."}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded px-4">
            <Link2 className="w-3 h-3" />
            <span className="font-mono">https://example.com/blog/{slug || "your-slug-here"}</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
