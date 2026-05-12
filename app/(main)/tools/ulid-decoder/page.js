"use client"

import { useState, useEffect } from "react"
import { decodeTime } from "ulid"
import { validate as uuidValidate, version as uuidVersion } from "uuid"
import { Fingerprint, Clock, Hash, Calendar, Info, AlertCircle, CheckCircle2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ToolLayout from "@/components/tools/ToolLayout"
import { format } from "date-fns"

export default function UlidDecoderTool() {
  const [input, setInput] = useState("01H7B8R2G0R6XQZ8Y8Z9X4X1W2")
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const decodeId = (id) => {
    try {
      const trimmed = id.trim()
      if (!trimmed) {
        setResult(null)
        setError(null)
        return
      }

      // Check if it's a ULID (26 chars, Crockford's Base32)
      if (trimmed.length === 26 && /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(trimmed)) {
        const timestamp = decodeTime(trimmed)
        const date = new Date(timestamp)
        setResult({
          type: "ULID",
          timestamp,
          date,
          randomness: trimmed.substring(10),
          info: "ULIDs are 128-bit identifiers that are lexicographically sortable by time."
        })
        setError(null)
        return
      }

      // Check if it's a UUID
      if (uuidValidate(trimmed)) {
        const version = uuidVersion(trimmed)
        let timestamp = null
        let date = null
        let info = `UUID v${version} detected.`

        if (version === 1) {
          // UUID v1 has a timestamp, but extracting it is complex
          // For simplicity, we'll just note it's v1
          info += " Version 1 contains a timestamp based on the system clock."
        } else if (version === 4) {
          info += " Version 4 is completely random."
        }

        setResult({
          type: `UUID v${version}`,
          timestamp: null,
          date: null,
          info
        })
        setError(null)
        return
      }

      setError("Unknown or invalid identifier format")
      setResult(null)
    } catch (e) {
      setError("Error decoding identifier")
      setResult(null)
    }
  }

  useEffect(() => {
    decodeId(input)
  }, [input])

  return (
    <ToolLayout 
      title="UID / ULID Decoder" 
      description="Extract timestamps, versions, and metadata from ULIDs and UUIDs. Understand when an ID was generated."
    >
      <div className="space-y-8">
        <div className="p-8 rounded-3xl border bg-card space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Search className="w-4 h-4" />
              Identifier to Decode
            </Label>
            <div className="relative">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`h-14 pl-12 text-lg font-mono rounded-2xl border-2 transition-all ${error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                placeholder="Paste ULID or UUID here..."
              />
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border bg-card space-y-2">
                   <div className="flex items-center gap-2 text-primary">
                      <Hash className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Type</span>
                   </div>
                   <p className="text-2xl font-black">{result.type}</p>
                </div>
                {result.date && (
                  <div className="p-6 rounded-2xl border bg-card space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Generation Date</span>
                    </div>
                    <p className="text-lg font-bold">{format(result.date, "PPP")}</p>
                    <p className="text-xs text-muted-foreground">{format(result.date, "pp")}</p>
                  </div>
                )}
              </div>

              {result.timestamp && (
                <div className="p-6 rounded-2xl border bg-card space-y-4">
                   <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Internal Breakdown</span>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                         <span className="text-sm text-muted-foreground">Unix Timestamp</span>
                         <code className="text-sm font-bold">{result.timestamp}</code>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                         <span className="text-sm text-muted-foreground">Randomness Part</span>
                         <code className="text-sm font-bold truncate max-w-[200px]">{result.randomness}</code>
                      </div>
                   </div>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                 <Info className="w-6 h-6 text-primary shrink-0" />
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   {result.info}
                 </p>
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-6 rounded-3xl border bg-card flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                     <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="font-bold text-xl">Valid Format</h3>
                  <p className="text-sm text-muted-foreground">This identifier follows the official {result.type} specification.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
