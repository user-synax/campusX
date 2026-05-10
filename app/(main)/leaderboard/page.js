"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Zap, Globe, School, Loader2, ChevronRight, Medal } from 'lucide-react';
import { UserAvatar } from '@/components/user';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import useUser from '@/hooks/useUser';

export default function LeaderboardPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${activeTab}`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 0: return 'text-yellow-500'; // Gold
      case 1: return 'text-zinc-400';   // Silver
      case 2: return 'text-amber-700';  // Bronze
      default: return 'text-muted-foreground/30';
    }
  };

  const getRankIcon = (rank) => {
    if (rank < 3) return <Medal className={cn("w-5 h-5", getRankColor(rank))} />;
    return <span className="text-lg font-black italic w-5 text-center">{rank + 1}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8 space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Hall of Fame</h1>
        <p className="text-muted-foreground max-w-md">
          The top students driving the community forward. Earn XP by being active!
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="global" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 h-12 bg-zinc-900/50 p-1">
          <TabsTrigger value="global" className="data-[state=active]:bg-zinc-800">
            <Globe className="w-4 h-4 mr-2" />
            Global
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-zinc-800">
            <Zap className="w-4 h-4 mr-2" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="college" className="data-[state=active]:bg-zinc-800" disabled={!user?.college}>
            <School className="w-4 h-4 mr-2" />
            My College
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Calculating ranks...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-3xl bg-zinc-900/20">
              <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No rankings yet</h3>
              <p className="text-sm text-muted-foreground">Be the first to climb the leaderboard!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {leaderboard.map((item, i) => (
                <Link key={item.id || item.username} href={`/profile/${item.username}`}>
                  <Card className={cn(
                    "group relative overflow-hidden flex items-center gap-4 p-4 transition-all hover:bg-zinc-900/50 border-border/50 hover:border-primary/30",
                    i < 3 && "bg-primary/[0.02] border-primary/10"
                  )}>
                    {/* Rank Indicator */}
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(i)}
                    </div>

                    {/* User Info */}
                    <UserAvatar user={item} size="md" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold truncate group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                        {item.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">@{item.username}</span>
                        <span>•</span>
                        <span className="truncate">{item.college || 'Community'}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-primary font-black text-lg">
                        <Zap className="w-4 h-4 fill-primary" />
                        {item.score?.toLocaleString() || 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        XP Points
                      </div>
                    </div>

                    {/* Subtle Hover Decoration */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Your Rank Footer (Sticky) */}
      {user && !loading && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-40 pointer-events-none md:bottom-6">
          <div className="bg-zinc-900/90 backdrop-blur-md border border-primary/20 p-4 rounded-2xl shadow-2xl shadow-black/50 flex items-center gap-4 pointer-events-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Your Current Level</span>
              <span className="text-xl font-black text-primary">Lvl {user.level || 1}</span>
            </div>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${((user.xp || 0) % 1000) / 10}%` }}
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total XP</span>
              <div className="flex items-center justify-end gap-1 font-black text-lg">
                <Zap className="w-3 h-3 fill-primary text-primary" />
                {(user.totalXP || user.xp || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
