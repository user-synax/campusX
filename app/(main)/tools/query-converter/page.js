"use client"

import { useState, useEffect } from "react"
import { ArrowLeftRight, Copy, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function QueryConverterTool() {
  const [queryString, setQueryString] = useState("name=John+Doe&age=25&hobbies=coding&hobbies=reading&isDeveloper=true")
  const [jsonString, setJsonString] = useState("")
  const [error, setError] = useState(null)
  const [lastEdited, setLastEdited] = useState("query") // 'query' or 'json'

  const convertQueryToJson = (query) => {
    try {
      if (!query.trim()) {
        setJsonString("{}")
        setError(null)
        return
      }

      // Handle leading '?' if present
      const cleanQuery = query.startsWith("?") ? query.substring(1) : query
      const params = new URLSearchParams(cleanQuery)
      const obj = {}

      params.forEach((value, key) => {
        // Handle multiple values for same key (arrays)
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (Array.isArray(obj[key])) {
            obj[key].push(value)
          } else {
            obj[key] = [obj[key], value]
          }
        } else {
          // Attempt to parse numbers and booleans
          if (value === "true") obj[key] = true
          else if (value === "false") obj[key] = false
          else if (!isNaN(value) && value !== "") obj[key] = Number(value)
          else obj[key] = value
        }
      })

      setJsonString(JSON.stringify(obj, null, 2))
      setError(null)
    } catch (e) {
      setError("Invalid Query String format")
    }
  }

  const convertJsonToQuery = (json) => {
    try {
      if (!json.trim()) {
        setQueryString("")
        setError(null)
        return
      }

      const obj = JSON.parse(json)
      const params = new URLSearchParams()

      const flatten = (data, prefix = "") => {
        Object.entries(data).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}[${key}]` : key
          if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            flatten(value, fullKey)
          } else if (Array.isArray(value)) {
            value.forEach((item) => params.append(fullKey, item))
          } else {
            params.append(fullKey, value)
          }
        })
      }

      flatten(obj)
      setQueryString(decodeURIComponent(params.toString()))
      setError(null)
    } catch (e) {
      setError("Invalid JSON format")
    }
  }

  useEffect(() => {
    if (lastEdited === "query") {
      convertQueryToJson(queryString)
    }
  }, [queryString])

  useEffect(() => {
    if (lastEdited === "json") {
      convertJsonToQuery(jsonString)
    }
  }, [jsonString])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const clearAll = () => {
    setQueryString("")
    setJsonString("")
    setError(null)
  }

  return (
    <ToolLayout 
      title="Query String ↔ JSON Converter" 
      description="Easily convert between URL query parameters and JSON objects. Supports arrays and nested objects."
    >
      <div className="space-y-6">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={clearAll} className="h-8">
            <Trash2 className="w-3 h-3 mr-2" />
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                Query String
                {lastEdited === "query" && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </Label>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(queryString)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Textarea 
              value={queryString}
              onChange={(e) => {
                setLastEdited("query")
                setQueryString(e.target.value)
              }}
              className="min-h-[300px] font-mono text-sm p-4 bg-card focus-visible:ring-primary"
              placeholder="key1=value1&key2=value2..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                JSON Object
                {lastEdited === "json" && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </Label>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(jsonString)}>
                <Copy className="w-4 h-4" />
              </Button>
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
             <span className="text-sm font-medium">Bidirectional Live Sync</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!error && (queryString || jsonString) && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-500 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Valid conversion active
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
