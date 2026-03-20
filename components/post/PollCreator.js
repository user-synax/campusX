"use client"

import { Plus, Minus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function PollCreator({ options, onChange, onRemove }) {
  const addOption = () => {
    if (options.length < 4) {
      onChange([...options, ''])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      onChange(newOptions)
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    onChange(newOptions)
  }

  return (
    <div className="mt-3 border border-border rounded-lg p-3 space-y-2 bg-accent/5"> 
      <div className="flex justify-between items-center mb-2"> 
        <p className="text-sm font-medium">Poll options</p> 
        <button 
          type="button"
          onClick={onRemove} 
          className="text-muted-foreground hover:text-destructive transition-colors"
        > 
          <X className="w-4 h-4" /> 
        </button> 
      </div> 
      
      {options.map((opt, i) => ( 
        <div key={i} className="flex gap-2 items-center"> 
          <Input 
            placeholder={i < 2 ? `Option ${i + 1} (required)` : `Option ${i + 1} (optional)`} 
            value={opt} 
            onChange={(e) => updateOption(i, e.target.value)} 
            maxLength={80} 
            className="flex-1 h-9" 
          /> 
          {i >= 2 && ( 
            <button 
              type="button"
              onClick={() => removeOption(i)} 
              className="text-muted-foreground hover:text-destructive transition-colors"
            > 
              <Minus className="w-4 h-4" /> 
            </button> 
          )} 
        </div> 
      ))} 
      
      {options.length < 4 && ( 
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          onClick={addOption} 
          className="w-full border border-dashed border-border h-9 text-xs"
        > 
          <Plus className="w-4 h-4 mr-1" /> Add option 
        </Button> 
      )} 
      
      <p className="text-[10px] text-muted-foreground text-center">Poll expires in 24 hours</p> 
    </div>
  )
}
