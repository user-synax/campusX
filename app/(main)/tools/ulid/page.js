"use client"

import { useState, useEffect } from "react"
import { ulid } from "ulid"
import { Copy, RefreshCw, Check, ListPlus, Fingerprint, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function UlidTool() {
  const [currentUlid, setCurrentUlid] = useState("")
  const [batchSize, setBatchSize] = useState(10)
  const [batchResults, setBatchResults] = useState([])
  const [copied, setCopied] = useState(null)

  const generateSingle = () => {
    setCurrentUlid(ulid())
  }

  const generateBatch = () => {
    const results = []
    for (let i = 0; i < batchSize; i++) {
      results.push(ulid())
    }
    setBatchResults(results)
  }

  useEffect(() => {
    generateSingle()
    generateBatch()
  }, [])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ToolLayout 
      title="ULID Generator" 
      description="Generate Universally Unique Lexicographically Sortable Identifiers. ULIDs are 128-bit, case-insensitive, and sortable by time."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border bg-card space-y-4">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Single ULID</Label>
              <div className="flex gap-2">
                <Input value={currentUlid} readOnly className="font-mono h-12 text-lg bg-muted/50" />
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={generateSingle}>
                  <RefreshCw className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => copyToClipboard(currentUlid, "single")}>
                  {copied === "single" ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-tighter">
                <Info className="w-3 h-3" />
                What is a ULID?
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                ULID (Universally Unique Lexicographically Sortable Identifier) is an alternative to UUID. 
                It is 128-bit, URL-safe, and encodes a timestamp which makes it sortable. 
                Unlike UUID v4, ULIDs generated close to each other will be in chronological order.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-card flex flex-col justify-center items-center text-center space-y-4">
            <Fingerprint className="w-16 h-16 text-primary opacity-20" />
            <div className="space-y-2">
              <h3 className="font-bold text-xl">Quick Generation</h3>
              <p className="text-sm text-muted-foreground">Need a fresh sortable identifier for your database?</p>
              <Button onClick={generateSingle} className="w-full mt-2 h-11 rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ListPlus className="w-5 h-5" />
              Batch Generation
            </h2>
            <div className="flex items-center gap-2">
              <Label className="shrink-0">Amount:</Label>
              <Input 
                type="number" 
                min="1" 
                max="500" 
                className="w-24 h-9"
                value={batchSize} 
                onChange={(e) => setBatchSize(Math.min(500, parseInt(e.target.value) || 1))}
              />
              <Button size="sm" onClick={generateBatch}>Generate Batch</Button>
            </div>
          </div>

          {batchResults.length > 0 && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute right-4 top-4 flex gap-2">
                   <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8"
                    onClick={() => copyToClipboard(batchResults.join("\n"), "batch")}
                  >
                    {copied === "batch" ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied === "batch" ? "Copied!" : "Copy All"}
                  </Button>
                </div>
                <pre className="p-6 rounded-2xl bg-muted font-mono text-sm max-h-[400px] overflow-y-auto whitespace-pre-wrap border shadow-inner pt-14">
                  {batchResults.join("\n")}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
