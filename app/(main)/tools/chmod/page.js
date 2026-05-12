"use client"

import { useState, useEffect } from "react"
import { Lock, Unlock, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import ToolLayout from "@/components/tools/ToolLayout"

export default function ChmodTool() {
  const [permissions, setPermissions] = useState({
    owner: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    public: { read: true, write: false, execute: false }
  })
  const [octal, setOctal] = useState("644")
  const [symbolic, setSymbolic] = useState("-rw-r--r--")

  const calculateChmod = () => {
    const calculateValue = (perms) => {
      let val = 0
      if (perms.read) val += 4
      if (perms.write) val += 2
      if (perms.execute) val += 1
      return val
    }

    const o = calculateValue(permissions.owner)
    const g = calculateValue(permissions.group)
    const p = calculateValue(permissions.public)
    
    setOctal(`${o}${g}${p}`)

    const getSym = (perms) => {
      return `${perms.read ? 'r' : '-'}${perms.write ? 'w' : '-'}${perms.execute ? 'x' : '-'}`
    }
    setSymbolic(`-${getSym(permissions.owner)}${getSym(permissions.group)}${getSym(permissions.public)}`)
  }

  useEffect(() => {
    calculateChmod()
  }, [permissions])

  const togglePerm = (role, type) => {
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [type]: !prev[role][type] }
    }))
  }

  return (
    <ToolLayout 
      title="Chmod Calculator" 
      description="Visual calculator for Unix file permissions. Easily generate octal and symbolic modes."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["owner", "group", "public"].map(role => (
            <div key={role} className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
              <h3 className="text-lg font-bold capitalize flex items-center gap-2">
                {role === "owner" ? <Lock className="w-4 h-4" /> : role === "group" ? <Shield className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {role}
              </h3>
              <div className="space-y-4">
                {["read", "write", "execute"].map(type => (
                  <div key={type} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => togglePerm(role, type)}>
                    <Label className="capitalize cursor-pointer font-medium">{type}</Label>
                    <Checkbox checked={permissions[role][type]} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center text-center shadow-xl shadow-primary/20">
            <span className="text-sm font-medium opacity-70 mb-2 uppercase tracking-widest">Octal Notation</span>
            <h2 className="text-6xl font-black tracking-tighter">{octal}</h2>
            <p className="mt-4 font-mono text-sm opacity-80 bg-black/20 px-3 py-1 rounded">chmod {octal} file.txt</p>
          </div>
          <div className="p-8 rounded-2xl bg-muted border flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-widest">Symbolic Notation</span>
            <h2 className="text-4xl font-mono font-bold tracking-tight">{symbolic}</h2>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
          <h4 className="font-bold flex items-center gap-2 text-sm">
            <Info className="w-4 h-4" />
            Permission Values
          </h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Read (r)</span>
              <span className="font-bold">4</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Write (w)</span>
              <span className="font-bold">2</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Execute (x)</span>
              <span className="font-bold">1</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
