"use client"

import { useState, useEffect } from "react"
import { serialize, unserialize } from "php-serialize"
import { ArrowLeftRight, Copy, Trash2, AlertCircle, CheckCircle2, FileCode, Braces } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function PhpSerializerTool() {
  const [phpString, setPhpString] = useState('a:3:{s:4:"name";s:8:"John Doe";s:3:"age";i:25;s:7:"isAdmin";b:1;}')
  const [jsonString, setJsonString] = useState("")
  const [error, setError] = useState(null)
  const [lastEdited, setLastEdited] = useState("php")

  const convertPhpToJson = (php) => {
    try {
      if (!php.trim()) {
        setJsonString("{}")
        setError(null)
        return
      }
      const data = unserialize(php)
      setJsonString(JSON.stringify(data, null, 2))
      setError(null)
    } catch (e) {
      setError("Invalid PHP Serialize format")
    }
  }

  const convertJsonToPhp = (json) => {
    try {
      if (!json.trim()) {
        setPhpString("")
        setError(null)
        return
      }
      const data = JSON.parse(json)
      const serialized = serialize(data)
      setPhpString(serialized)
      setError(null)
    } catch (e) {
      setError("Invalid JSON format")
    }
  }

  useEffect(() => {
    if (lastEdited === "php") {
      convertPhpToJson(phpString)
    }
  }, [phpString])

  useEffect(() => {
    if (lastEdited === "json") {
      convertJsonToPhp(jsonString)
    }
  }, [jsonString])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <ToolLayout 
      title="PHP Serialize ↔ JSON Converter" 
      description="Convert PHP's serialize() format to JSON and vice versa. Perfect for debugging database blobs or legacy data."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                PHP Serialized
                {lastEdited === "php" && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </Label>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(phpString)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPhpString("")}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Textarea 
              value={phpString}
              onChange={(e) => {
                setLastEdited("php")
                setPhpString(e.target.value)
              }}
              className="min-h-[300px] font-mono text-sm p-4 bg-card focus-visible:ring-primary"
              placeholder='a:1:{s:3:"key";s:5:"value";}'
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Braces className="w-4 h-4" />
                JSON Object
                {lastEdited === "json" && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </Label>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(jsonString)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setJsonString("")}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Textarea 
              value={jsonString}
              onChange={(e) => {
                setLastEdited("json")
                setJsonString(e.target.value)
              }}
              className="min-h-[300px] font-mono text-sm p-4 bg-card focus-visible:ring-primary"
              placeholder='{ "key": "value" }'
            />
          </div>
        </div>

        <div className="flex justify-center py-4">
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20">
             <ArrowLeftRight className="w-5 h-5 text-primary" />
             <span className="text-sm font-medium">Bidirectional Conversion</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!error && (phpString || jsonString) && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Valid conversion active
          </div>
        )}

        <div className="p-6 rounded-2xl border bg-card/50 space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest">About PHP Serialization</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            PHP's <code>serialize()</code> function generates a storable representation of a value. This is commonly used in PHP applications to store complex data structures in databases or sessions. This tool allows you to easily inspect and modify this data using JSON.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
