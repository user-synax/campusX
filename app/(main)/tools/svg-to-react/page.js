"use client"

import { useState } from "react"
import { FileType, Copy, Check, RefreshCw, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function SvgToReactTool() {
  const [svgInput, setSvgInput] = useState("")
  const [componentName, setComponentName] = useState("Icon")
  const [useTypescript, setUseTypescript] = useState(true)
  const [useLucideProps, setUseLucideProps] = useState(true)
  const [result, setResult] = useState("")
  const [copied, setCopied] = useState(false)

  const convertSvg = () => {
    if (!svgInput) return

    try {
      // Basic cleanup and conversion logic
      let processed = svgInput
        .replace(/class=/g, "className=")
        .replace(/for=/g, "htmlFor=")
        .replace(/stroke-width=/g, "strokeWidth=")
        .replace(/stroke-linecap=/g, "strokeLinecap=")
        .replace(/stroke-linejoin=/g, "strokeLinejoin=")
        .replace(/fill-rule=/g, "fillRule=")
        .replace(/clip-rule=/g, "clipRule=")
        .replace(/stop-color=/g, "stopColor=")
        .replace(/stop-opacity=/g, "stopOpacity=")
        .replace(/xml:space=/g, "xmlSpace=")
        .replace(/xlink:href=/g, "xlinkHref=")
        .replace(/stroke-miterlimit=/g, "strokeMiterlimit=")
        .replace(/stroke-dasharray=/g, "strokeDasharray=")
        .replace(/stroke-dashoffset=/g, "strokeDashoffset=")
        .replace(/stroke-opacity=/g, "strokeOpacity=")
        .replace(/fill-opacity=/g, "fillOpacity=")

      // Extract paths and other elements inside <svg>
      const svgMatch = processed.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
      const content = svgMatch ? svgMatch[1].trim() : processed

      // Extract original width/height/viewBox if possible
      const viewBoxMatch = svgInput.match(/viewBox="([^"]+)"/i)
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24"

      const componentCode = useTypescript 
        ? `import React from 'react';

${useLucideProps ? "interface IconProps extends React.SVGProps<SVGSVGElement> {\n  size?: number | string;\n}" : "interface IconProps extends React.SVGProps<SVGSVGElement> {}"}

const ${componentName} = ({ ${useLucideProps ? "size = 24, " : ""}...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={${useLucideProps ? "size" : "24"}}
    height={${useLucideProps ? "size" : "24"}}
    viewBox="${viewBox}"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    ${content}
  </svg>
);

export default ${componentName};`
        : `import React from 'react';

const ${componentName} = ({ ${useLucideProps ? "size = 24, " : ""}...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={${useLucideProps ? "size" : "24"}}
    height={${useLucideProps ? "size" : "24"}}
    viewBox="${viewBox}"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    ${content}
  </svg>
);

export default ${componentName};`

      setResult(componentCode)
      toast.success("Converted successfully")
    } catch (err) {
      toast.error("Error converting SVG. Please check the input.")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout 
      title="SVG to React" 
      description="Transform raw SVG code into clean, production-ready React components."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>SVG Input</Label>
            <Textarea 
              placeholder="Paste <svg>...</svg> code here" 
              className="font-mono h-64 text-xs"
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
            />
          </div>

          <div className="p-4 rounded-xl border bg-muted/30 space-y-4">
            <div className="space-y-2">
              <Label>Component Name</Label>
              <Input 
                value={componentName} 
                onChange={(e) => setComponentName(e.target.value)} 
                placeholder="e.g. UserIcon"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>TypeScript</Label>
                <p className="text-xs text-muted-foreground">Add interface definitions</p>
              </div>
              <Switch checked={useTypescript} onCheckedChange={setUseTypescript} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lucide-style Props</Label>
                <p className="text-xs text-muted-foreground">Add size and stroke support</p>
              </div>
              <Switch checked={useLucideProps} onCheckedChange={setUseLucideProps} />
            </div>

            <Button onClick={convertSvg} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Convert to Component
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>React Component</Label>
            {result && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy
              </Button>
            )}
          </div>
          <div className="relative">
            <Textarea 
              readOnly 
              className="font-mono h-[420px] text-xs bg-muted/50"
              value={result}
              placeholder="Converted code will appear here..."
            />
          </div>
          {!result && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground opacity-50 py-20">
              <Code2 className="w-12 h-12 mb-2" />
              <p>Paste SVG code to generate component</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
