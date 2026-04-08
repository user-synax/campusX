"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Users, Clock, BookOpen, Lock, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatTimeRemaining(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  if (hours > 0) {
    return `${hours}h left`;
  }
  return `${minutes}m left`;
}

export default function RoomCard({ room, currentUser, onJoin }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setJoining(true);
    try {
      const res = await fetch(`/api/study-rooms/${room._id}/join`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/study-rooms/${room._id}`);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setJoining(false);
    }
  };

  const isParticipant =
    currentUser &&
    room.participants.some((p) => p._id === currentUser._id);

  return (
    <Link href={`/study-rooms/${room._id}`}>
      <div
        className={cn(
          "group relative flex flex-col p-5 rounded-xl border border-white/10 bg-zinc-900/50",
          "hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-150"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-100 truncate mb-1">
              {room.name}
            </h3>
            {room.subject && (
              <Badge
                variant="secondary"
                className="text-[10px] font-medium bg-blue-500/20 text-blue-300 border-blue-500/30"
              >
                {room.subject}
              </Badge>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "ml-2 text-[10px] font-medium shrink-0",
              room.isPublic
                ? "border-green-500/30 text-green-400 bg-green-500/10"
                : "border-amber-500/30 text-amber-400 bg-amber-500/10"
            )}
          >
            {room.isPublic ? (
              <Globe className="w-3 h-3 mr-1" />
            ) : (
              <Lock className="w-3 h-3 mr-1" />
            )}
            {room.isPublic ? "Public" : "Private"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={room.creator?.avatar} />
            <AvatarFallback className="text-[10px]">
              {room.creator?.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-zinc-400 truncate">
            {room.creator?.name}
          </span>
        </div>

        {room.college && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate">{room.college}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">{room.participants?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTimeRemaining(room.expiresAt)}</span>
            </div>
          </div>

          {isParticipant ? (
            <Button size="sm" variant="ghost" className="text-blue-400">
              Enter
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleJoin}
              disabled={joining}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {joining ? "Joining..." : "Join Room"}
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
