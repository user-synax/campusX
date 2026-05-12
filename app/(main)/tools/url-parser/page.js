"use client"

import { useState, useEffect } from "react"
import { Globe, Search, Copy, AlertCircle, Info, Link2, Settings, Hash, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function UrlParserTool() {
  const [input, setInput] = useState("https://user:pass@example.com:8080/p/a/t/h?query=string&tag=nextjs#hash-fragment")
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)

  const parseUrl = (urlStr) => {
    try {
      const trimmed = urlStr.trim()
      if (!trimmed) {
        setParsed(null)
        setError(null)
        return
      }

      const url = new URL(trimmed)
      const queryParams = []
      url.searchParams.forEach((value, key) => {
        queryParams.push({ key, value })
      })

      setParsed({
        protocol: url.protocol,
        username: url.username,
        password: url.password,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        host: url.host,
        origin: url.origin,
        queryParams,
      })
      setError(null)
    } catch (e) {
      setError("Invalid URL format")
      setParsed(null)
    }
  }

  useEffect(() => {
    parseUrl(input)
  }, [input])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <ToolLayout 
      title="URL Parser" 
      description="Break down complex URLs into their individual components. Inspect protocols, hosts, paths, and query parameters."
    >
      <div className="space-y-8">
        <div className="p-8 rounded-3xl border bg-card space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4" />
              URL to Parse
            </Label>
            <div className="relative">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`h-14 pl-12 text-lg font-mono rounded-2xl border-2 transition-all ${error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                placeholder="https://example.com/path?query=1"
              />
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        </div>

        {parsed && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl border bg-card space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                  <Settings className="w-4 h-4" />
                  Core Components
                </h3>
                <div className="space-y-1">
                  {[
                    { label: "Protocol", value: parsed.protocol, icon: <Globe className="w-3 h-3" /> },
                    { label: "Hostname", value: parsed.hostname, icon: <Globe className="w-3 h-3" /> },
                    { label: "Port", value: parsed.port || "Default", icon: <Settings className="w-3 h-3" /> },
                    { label: "Pathname", value: parsed.pathname, icon: <Link2 className="w-3 h-3" /> },
                    { label: "Origin", value: parsed.origin, icon: <Database className="w-3 h-3" /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             {item.icon}
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                             <p className="text-sm font-mono break-all">{item.value}</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => copyToClipboard(item.value)}>
                          <Copy className="w-3 h-3" />
                       </Button>
                    </div>
                  ))}
                </div>
              </div>

              {parsed.queryParams.length > 0 && (
                <div className="p-6 rounded-2xl border bg-card space-y-4">
                  <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                    <Search className="w-4 h-4" />
                    Query Parameters ({parsed.queryParams.length})
                  </h3>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground tracking-widest">Key</th>
                          <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground tracking-widest">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {parsed.queryParams.map((param, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono text-xs text-primary">{param.key}</td>
                            <td className="px-4 py-3 font-mono text-xs break-all">{param.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
               <div className="p-6 rounded-3xl border bg-card space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                     <Hash className="w-4 h-4" />
                     <h3 className="font-bold text-sm uppercase tracking-widest">Fragment</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border font-mono text-sm break-all min-h-[60px] flex items-center">
                     {parsed.hash || <span className="text-muted-foreground italic">None</span>}
                  </div>
               </div>

               {(parsed.username || parsed.password) && (
                 <div className="p-6 rounded-3xl border bg-amber-500/5 border-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-amber-500">
                       <AlertCircle className="w-4 h-4" />
                       <h3 className="font-bold text-sm uppercase tracking-widest">Credentials</h3>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">User:</span>
                          <span className="font-mono">{parsed.username}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Pass:</span>
                          <span className="font-mono">********</span>
                       </div>
                    </div>
                 </div>
               )}

               <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
                  <Info className="w-6 h-6 text-blue-500 shrink-0" />
                  <p className="text-[11px] text-blue-200/70 leading-relaxed">
                    URLs are parsed using the standard Web API <code>URL</code> constructor, ensuring compatibility with browser navigation and API calls.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
