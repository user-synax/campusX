"use client"

import { useState, useEffect } from "react"
import { Copyright, Copy, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

const LICENSES = [
  { label: "MIT", value: "mit" },
  { label: "Apache 2.0", value: "apache" },
  { label: "GPL 3.0", value: "gpl" },
  { label: "BSD 3-Clause", value: "bsd" },
  { label: "None (All Rights Reserved)", value: "none" }
]

export default function CopyrightTool() {
  const [name, setName] = useState("Your Company or Name")
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [license, setLicense] = useState("mit")
  const [results, setResults] = useState({ footer: "", header: "" })
  const [copied, setCopied] = useState(null)

  const generateCopyright = () => {
    const footer = `© ${year} ${name}. All rights reserved.`
    
    let header = `/**\n * Copyright (c) ${year} ${name}\n *`
    
    switch (license) {
      case "mit":
        header += `\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */`
        break
      case "apache":
        header += `\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n */`
        break
      default:
        header += `\n * All rights reserved.\n */`
    }

    setResults({ footer, header })
  }

  useEffect(() => {
    generateCopyright()
  }, [name, year, license])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ToolLayout 
      title="Copyright Generator" 
      description="Generate professional copyright notices, license headers, and footer snippets for your projects."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Entity Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>License Type</Label>
            <Select value={license} onValueChange={setLicense}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LICENSES.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="footer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="footer">Footer Snippet</TabsTrigger>
            <TabsTrigger value="header">Code Header</TabsTrigger>
          </TabsList>

          <TabsContent value="footer" className="space-y-4 m-0">
            <div className="flex justify-between items-center">
              <Label className="font-bold">Result</Label>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.footer, "footer")}>
                {copied === "footer" ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy
              </Button>
            </div>
            <div className="p-12 rounded-2xl bg-muted border flex flex-col items-center justify-center text-center shadow-inner">
              <p className="text-2xl font-medium">{results.footer}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
              <Info className="w-4 h-4 text-primary" />
              Usage: Best for website footers, emails, and documentation.
            </div>
          </TabsContent>

          <TabsContent value="header" className="space-y-4 m-0">
            <div className="flex justify-between items-center">
              <Label className="font-bold">Source Code Header</Label>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.header, "header")}>
                {copied === "header" ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy
              </Button>
            </div>
            <pre className="p-6 rounded-2xl bg-muted border font-mono text-sm overflow-auto">
              {results.header}
            </pre>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
              <Info className="w-4 h-4 text-primary" />
              Usage: Paste at the very top of your source files (.js, .ts, .py, etc.)
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  )
}
