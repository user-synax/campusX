"use client"

import { useState, useEffect } from "react"
import { v1 as uuidv1, v4 as uuidv4 } from "uuid"
import { ulid } from "ulid"
import { Copy, RefreshCw, Check, ListPlus, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function UuidTool() {
  const [uuidV1, setUuidV1] = useState("")
  const [uuidV4, setUuidV4] = useState("")
  const [ulidStr, setUlidStr] = useState("")
  const [batchSize, setBatchSize] = useState(5)
  const [batchResults, setBatchResults] = useState([])
  const [copied, setCopied] = useState(null)

  const generateAll = () => {
    setUuidV1(uuidv1())
    setUuidV4(uuidv4())
    setUlidStr(ulid())
  }

  useEffect(() => {
    generateAll()
  }, [])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  const generateBatch = (type) => {
    const results = []
    for (let i = 0; i < batchSize; i++) {
      if (type === "v1") results.push(uuidv1())
      else if (type === "v4") results.push(uuidv4())
      else results.push(ulid())
    }
    setBatchResults(results)
  }

  return (
    <ToolLayout 
      title="UUID & ULID Generators" 
      description="Generate universally unique identifiers and universally unique lexicographically sortable identifiers."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>UUID v1 (Time-based)</Label>
              <div className="flex gap-2">
                <Input value={uuidV1} readOnly className="font-mono bg-muted/50" />
                <Button variant="outline" size="icon" onClick={() => setUuidV1(uuidv1())}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(uuidV1, "v1")}>
                  {copied === "v1" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>UUID v4 (Random)</Label>
              <div className="flex gap-2">
                <Input value={uuidV4} readOnly className="font-mono bg-muted/50" />
                <Button variant="outline" size="icon" onClick={() => setUuidV4(uuidv4())}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(uuidV4, "v4")}>
                  {copied === "v4" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ULID (Sortable)</Label>
              <div className="flex gap-2">
                <Input value={ulidStr} readOnly className="font-mono bg-muted/50" />
                <Button variant="outline" size="icon" onClick={() => setUlidStr(ulid())}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(ulidStr, "ulid")}>
                  {copied === "ulid" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10 flex flex-col justify-center items-center text-center space-y-4">
            <Fingerprint className="w-12 h-12 text-primary opacity-50" />
            <div>
              <h3 className="font-bold text-lg">Regenerate All</h3>
              <p className="text-sm text-muted-foreground mb-4">Click to refresh all single identifiers at once.</p>
              <Button onClick={generateAll} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ListPlus className="w-5 h-5" />
            Batch Generation
          </h2>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-[200px] space-y-2">
                <Label>Batch Size</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="100" 
                  value={batchSize} 
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
                />
              </div>
              <Tabs defaultValue="v4" className="flex-1">
                <TabsList>
                  <TabsTrigger value="v1">v1</TabsTrigger>
                  <TabsTrigger value="v4">v4</TabsTrigger>
                  <TabsTrigger value="ulid">ULID</TabsTrigger>
                </TabsList>
                <div className="mt-4 flex gap-2">
                  <TabsContent value="v1" className="m-0">
                    <Button onClick={() => generateBatch("v1")}>Generate v1 Batch</Button>
                  </TabsContent>
                  <TabsContent value="v4" className="m-0">
                    <Button onClick={() => generateBatch("v4")}>Generate v4 Batch</Button>
                  </TabsContent>
                  <TabsContent value="ulid" className="m-0">
                    <Button onClick={() => generateBatch("ulid")}>Generate ULID Batch</Button>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {batchResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Results</Label>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => copyToClipboard(batchResults.join("\n"), "batch")}
                  >
                    {copied === "batch" ? "Copied!" : "Copy All"}
                  </Button>
                </div>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-muted font-mono text-sm max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {batchResults.join("\n")}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
