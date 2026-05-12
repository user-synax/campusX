"use client"

import { useState } from "react"
import { faker } from "@faker-js/faker"
import { Database, Copy, Download, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ToolLayout from "@/components/tools/ToolLayout"
import { toast } from "sonner"

const ENTITY_TYPES = [
  { label: "User", value: "user" },
  { label: "Product", value: "product" },
  { label: "Post", value: "post" },
  { label: "Company", value: "company" },
  { label: "Address", value: "address" },
  { label: "Transaction", value: "transaction" }
]

export default function FakerTool() {
  const [entityType, setEntityType] = useState("user")
  const [count, setCount] = useState(5)
  const [format, setFormat] = useState("json")
  const [data, setData] = useState([])
  const [copied, setCopied] = useState(false)

  const generateData = () => {
    const results = []
    for (let i = 0; i < count; i++) {
      let item = {}
      switch (entityType) {
        case "user":
          item = {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            username: faker.internet.username(),
            avatar: faker.image.avatar(),
            birthdate: faker.date.birthdate().toISOString(),
            phone: faker.phone.number()
          }
          break
        case "product":
          item = {
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price(),
            category: faker.commerce.department(),
            image: faker.image.urlLoremFlickr({ category: 'product' }),
            sku: faker.string.alphanumeric(8).toUpperCase()
          }
          break
        case "post":
          item = {
            id: faker.string.uuid(),
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(2),
            authorId: faker.string.uuid(),
            createdAt: faker.date.recent().toISOString(),
            likes: faker.number.int({ min: 0, max: 1000 }),
            tags: faker.lorem.words(3).split(" ")
          }
          break
        case "company":
          item = {
            id: faker.string.uuid(),
            name: faker.company.name(),
            catchPhrase: faker.company.catchPhrase(),
            bs: faker.company.bs(),
            website: faker.internet.url(),
            email: faker.internet.email()
          }
          break
        case "address":
          item = {
            id: faker.string.uuid(),
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country(),
            coordinates: {
              lat: faker.location.latitude(),
              lng: faker.location.longitude()
            }
          }
          break
        case "transaction":
          item = {
            id: faker.string.uuid(),
            amount: faker.finance.amount(),
            date: faker.date.past().toISOString(),
            description: faker.finance.transactionDescription(),
            type: faker.finance.transactionType(),
            currency: faker.finance.currencyCode(),
            account: faker.finance.accountNumber()
          }
          break
      }
      results.push(item)
    }
    setData(results)
  }

  const formatData = () => {
    if (format === "json") {
      return JSON.stringify(data, null, 2)
    } else if (format === "csv") {
      if (data.length === 0) return ""
      const headers = Object.keys(data[0]).join(",")
      const rows = data.map(item => {
        return Object.values(item).map(val => {
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
          return `"${String(val).replace(/"/g, '""')}"`
        }).join(",")
      })
      return [headers, ...rows].join("\n")
    }
    return ""
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatData())
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    const blob = new Blob([formatData()], { type: format === "json" ? "application/json" : "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mock-data-${entityType}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Download started")
  }

  return (
    <ToolLayout 
      title="Dummy Data Generator" 
      description="Generate realistic mock data for your applications in JSON or CSV format."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Count</Label>
            <Input 
              type="number" 
              min="1" 
              max="100" 
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value) || 1)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateData} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>

        {data.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-bold">Preview</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadFile}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted font-mono text-sm max-h-[500px] overflow-y-auto whitespace-pre">
                {formatData()}
              </pre>
            </div>
          </div>
        )}

        {data.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-2xl">
            <Database className="w-12 h-12 text-muted-foreground opacity-20" />
            <div>
              <p className="text-muted-foreground">Select an entity type and click generate to see mock data.</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
