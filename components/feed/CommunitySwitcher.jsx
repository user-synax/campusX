"use client"

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus, Users } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import CreateCommunityDialog from '@/components/post/CreateCommunityDialog'

export default function CommunitySwitcher({ selectedCommunity, onSelect }) {
  const [open, setOpen] = useState(false)
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch('/api/communities')
        if (res.ok) {
          const data = await res.json()
          setCommunities(data)
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCommunities()
  }, [])

  const selected = communities.find((c) => c.slug === selectedCommunity)

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[150px] justify-between rounded-full bg-accent/20 border-border hover:bg-accent/40 transition-all"
          >
            {selected ? (
              <div className="flex items-center gap-2 truncate">
                <span>{selected.emoji || '🌐'}</span>
                <span className="truncate">{selected.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Communities</span>
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0 bg-background border-border shadow-xl">
          <Command className="bg-transparent">
            <CommandInput placeholder="Search community..." className="border-none focus:ring-0" />
            <CommandList>
              <CommandEmpty>No community found.</CommandEmpty>
              <CommandGroup heading="Communities">
                <CommandItem
                  onSelect={() => {
                    onSelect(null)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Users className="w-3 h-3" />
                    <span>Communities</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      !selectedCommunity ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
                {communities.map((community) => (
                  <CommandItem
                    key={community.slug}
                    onSelect={() => {
                      onSelect(community.slug)
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span>{community.emoji || '🌐'}</span>
                      <span className="truncate">{community.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedCommunity === community.slug ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t border-border p-1">
              <CreateCommunityDialog
                onCreated={() => {
                  // Refetch communities
                  fetch('/api/communities').then(res => res.json()).then(setCommunities)
                  setOpen(false)
                }}
                trigger={
                  <Button variant="ghost" className="w-full justify-start gap-2 h-9 px-2 rounded-md hover:bg-accent text-primary">
                    <Plus className="w-4 h-4" />
                    Create Community
                  </Button>
                }
              />
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
