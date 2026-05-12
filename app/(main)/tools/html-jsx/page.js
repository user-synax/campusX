"use client"

import { useState, useEffect } from "react"
import { Code2, Copy, Trash2, ArrowRightLeft, Info, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

export default function HtmlJsxTool() {
  const [input, setInput] = useState('<div class="container" onclick="alert(\'hello\')">\n  <label for="name">Name:</label>\n  <input type="text" id="name" tabindex="1" />\n  <br>\n  <hr>\n</div>')
  const [output, setOutput] = useState("")
  const [options, setOptions] = useState({
    createFunction: true,
    singleQuotes: false,
  })

  const convertHtmlToJsx = (html) => {
    let jsx = html

    // Replace attributes
    const replacements = [
      [/class=/g, "className="],
      [/for=/g, "htmlFor="],
      [/tabindex=/g, "tabIndex="],
      [/onclick=/g, "onClick="],
      [/onchange=/g, "onChange="],
      [/oninput=/g, "onInput="],
      [/onsubmit=/g, "onSubmit="],
      [/onkeydown=/g, "onKeyDown="],
      [/onkeyup=/g, "onKeyUp="],
      [/onkeypress=/g, "onKeyPress="],
      [/onmouseenter=/g, "onMouseEnter="],
      [/onmouseleave=/g, "onMouseLeave="],
      [/onmouseover=/g, "onMouseOver="],
      [/autoplay=/g, "autoPlay="],
      [/autocomplete=/g, "autoComplete="],
      [/autofocus=/g, "autoFocus="],
      [/readonly=/g, "readOnly="],
      [/maxlength=/g, "maxLength="],
      [/minlength=/g, "minLength="],
      [/srcset=/g, "srcSet="],
      [/crossorigin=/g, "crossOrigin="],
      [/spellcheck=/g, "spellCheck="],
      [/contenteditable=/g, "contentEditable="],
    ]

    replacements.forEach(([regex, replacement]) => {
      jsx = jsx.replace(regex, replacement)
    })

    // Self-closing tags
    const voidTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]
    voidTags.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*[^/])>`, "gi")
      jsx = jsx.replace(regex, `<${tag}$1 />`)
    })

    // Style attribute conversion (basic)
    jsx = jsx.replace(/style="([^"]*)"/g, (match, styleStr) => {
      const styles = styleStr.split(";").filter(s => s.trim()).map(s => {
        const [key, value] = s.split(":").map(x => x.trim())
        const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        return `${camelKey}: ${options.singleQuotes ? `'${value}'` : `"${value}"`}`
      })
      return `style={{ ${styles.join(", ")} }}`
    })

    if (options.createFunction) {
      jsx = `export default function Component() {\n  return (\n    ${jsx.split("\n").map(line => "    " + line).join("\n").trim()}\n  );\n}`
    }

    if (options.singleQuotes) {
      jsx = jsx.replace(/"/g, "'")
    }

    setOutput(jsx)
  }

  useEffect(() => {
    convertHtmlToJsx(input)
  }, [input, options])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast.success("JSX copied to clipboard")
  }

  return (
    <ToolLayout 
      title="HTML ⇄ JSX Converter" 
      description="Convert HTML snippets into React-compatible JSX. Handles attribute mapping and style objects."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">HTML Input</Label>
              <Button variant="ghost" size="sm" className="h-8" onClick={() => setInput("")}>
                <Trash2 className="w-3 h-3 mr-2" />
                Clear
              </Button>
            </div>
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm p-4 bg-card focus-visible:ring-primary"
              placeholder="Paste your HTML here..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold uppercase text-muted-foreground tracking-widest">JSX Output</Label>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative group">
               <Textarea 
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm p-4 bg-muted/50 border-primary/20 focus-visible:ring-primary"
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" onClick={copyToClipboard}>
                  <Copy className="w-3 h-3 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center space-x-2">
              <Switch 
                id="func" 
                checked={options.createFunction} 
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, createFunction: checked }))} 
              />
              <Label htmlFor="func" className="text-sm cursor-pointer">Wrap in Component</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="quotes" 
                checked={options.singleQuotes} 
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, singleQuotes: checked }))} 
              />
              <Label htmlFor="quotes" className="text-sm cursor-pointer">Single Quotes</Label>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
            <ArrowRightLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Auto-converting</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Attributes", desc: "class → className, for → htmlFor" },
            { title: "Inline Styles", desc: "style=\"color: red\" → style={{ color: 'red' }}" },
            { title: "Self-closing", desc: "Adds / to tags like <br> and <img>" },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl border bg-card/50 space-y-1">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-3 h-3" />
                <h4 className="text-xs font-bold uppercase tracking-tighter">{item.title}</h4>
              </div>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
