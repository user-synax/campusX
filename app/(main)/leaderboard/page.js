"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Star, ArrowUp } from "lucide-react"
import UserAvatar from "@/components/user/UserAvatar"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import CoinUsername from '@/components/coins/CoinUsername'
import CoinBadge from '@/components/coins/CoinBadge'


export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('global')

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/leaderboard${filter !== 'global' ? `?college=${filter}` : ''}`)
      const data = await res.json()
      if (res.ok) {
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-300" />
      case 3: return <Medal className="w-6 h-6 text-amber-600" />
      default: return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Campus Champions
        </h1>
        <p className="text-muted-foreground font-medium">
          Top students climbing the ranks on CampusX. Earn XP by posting, reacting, and helping others.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end pt-10">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-3xl bg-secondary/50" />)
        ) : leaderboard.length >= 1 ? (
          // Top 3 Podium: 2nd, 1st, 3rd
          [leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
            if (!user) return <div key={i} className="hidden md:block" />
            const isFirst = user.rank === 1
            const isSecond = user.rank === 2
            const isThird = user.rank === 3

            return (
              <Card key={user._id} className={cn(
                "relative overflow-hidden border-none bg-gradient-to-br transition-all duration-500",
                isFirst 
                  ? "from-yellow-500/20 to-orange-500/20 md:-translate-y-8 z-10 scale-105 shadow-2xl shadow-yellow-500/10 order-1 md:order-2" 
                  : "from-secondary/50 to-secondary/30 order-2 md:order-1",
                isSecond && "md:order-1",
                isThird && "order-3 md:order-3"
              )}>
                <CardContent className={cn(
                  "flex flex-col items-center gap-4",
                  isFirst ? "pt-12 pb-10" : "pt-8 pb-8"
                )}>
                  <div className="relative">
                    <UserAvatar 
                      user={user} 
                      className={cn(
                        "transition-transform duration-500",
                        isFirst ? "w-24 h-24 border-4 border-yellow-500" : "w-16 h-16 border-2 border-border"
                      )} 
                    />
                    <div className={cn(
                      "absolute -bottom-2 -right-2 rounded-full p-1.5 shadow-lg border-2 border-background bg-background",
                      isFirst ? "scale-125" : "scale-100"
                    )}>
                      {getRankIcon(user.rank)}
                    </div>
                  </div>
                  <div className="text-center flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 justify-center">
                      <Link href={`/profile/${user.username}`} className="hover:underline max-w-[150px] truncate">
                        <CoinUsername user={user} className={cn(
                          "font-black tracking-tight",
                          isFirst ? "text-lg" : "text-base"
                        )} />
                      </Link>
                      <CoinBadge user={user} size="sm" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground truncate max-w-[150px]">
                      {user.college}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors",
                    isFirst ? "bg-yellow-500 text-black border-yellow-400" : "bg-background/50 border-border"
                  )}>
                    <Star className={cn("w-4 h-4", isFirst ? "fill-black" : "text-yellow-500 fill-current")} />
                    <span className="font-black text-sm">{user.xp.toLocaleString()} XP</span>
                  </div>
                </CardContent>
                
                {/* Crown for #1 */}
                {isFirst && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                    👑
                  </div>
                )}
              </Card>
            )
          })
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No students ranked yet.
          </div>
        )}
      </div>

      <Card className="border-none bg-secondary/20 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Student</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Level</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4"><Skeleton className="h-12 w-full bg-secondary/50 rounded-xl" /></td>
                    </tr>
                  ))
                ) : leaderboard.slice(3).map((user) => (
                  <tr key={user._id} className="group hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">{getRankIcon(user.rank)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/profile/${user.username}`} className="flex items-center gap-3 group">
                        <UserAvatar user={user} className="w-10 h-10 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <CoinUsername user={user} className="font-bold text-sm group-hover:underline truncate" />
                            <CoinBadge user={user} size="xs" />
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{user.college}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        Lv. {user.level}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sm tabular-nums">
                      {user.xp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
