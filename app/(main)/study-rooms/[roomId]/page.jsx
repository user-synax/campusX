"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTLStore, defaultShapeUtils } from "@tldraw/tldraw";
import {
  Code2,
  PenLine,
  LogOut,
  Users,
  BookOpen,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import DesktopOnly from "@/components/study-rooms/DesktopOnly";
import CodeEditorPanel from "@/components/study-rooms/CodeEditorPanel";
import WhiteboardPanel from "@/components/study-rooms/WhiteboardPanel";
import useUser from "@/hooks/useUser";

const CURSOR_COLORS = ["#60a5fa", "#f472b6", "#34d399", "#fb923c", "#a78bfa", "#facc15"];

export default function StudyRoomPage({ params }) {
  const { roomId } = use(params);
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useUser();

  const [isDesktop, setIsDesktop] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("code");
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const whiteboardStoreRef = useRef(null);
  if (!whiteboardStoreRef.current) {
    whiteboardStoreRef.current = createTLStore({ shapeUtils: defaultShapeUtils });
  }

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop === false || userLoading) return;

    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/study-rooms/${roomId}`);
        const data = await res.json();
        if (res.ok) {
          setRoom(data.room);
          setParticipants(data.room.participants || []);
        } else {
          toast.error(data.error || "Room not found");
          router.push("/study-rooms");
        }
      } catch (error) {
        console.error("Failed to fetch room:", error);
        toast.error("Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRoom();
    }
  }, [roomId, currentUser, userLoading, isDesktop, router]);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const res = await fetch(`/api/study-rooms/${roomId}/leave`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Left the room");
        router.push("/study-rooms");
      }
    } catch (error) {
      console.error("Failed to leave room:", error);
      toast.error("Failed to leave room");
    } finally {
      setLeaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/study-rooms/${roomId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Room deleted");
        router.push("/study-rooms");
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  if (isDesktop === null) return null;
  if (!isDesktop) return <DesktopOnly />;

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-zinc-200 mb-2">Room not found</h2>
          <Button onClick={() => router.push("/study-rooms")} className="bg-blue-600">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const isCreator = currentUser?._id === room.creator?._id;
  const canDelete = isCreator;

  return (
    <TooltipProvider>
      <div className="h-[100dvh] bg-zinc-950 flex flex-col overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-zinc-100">{room.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {room.subject && (
                  <Badge variant="secondary" className="text-[10px] bg-blue-500/20 text-blue-300">
                    {room.subject}
                  </Badge>
                )}
                {room.college && (
                  <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {room.college}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    room.isPublic
                      ? "border-green-500/30 text-green-400"
                      : "border-amber-500/30 text-amber-400"
                  )}
                >
                  {room.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                  {room.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {participants.slice(0, 4).map((p, i) => (
                <Tooltip key={p._id}>
                  <TooltipTrigger>
                    <Avatar className="w-8 h-8 -ml-2 first:ml-0 border-2 border-zinc-900">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback className="text-xs">{p.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{p.name}</TooltipContent>
                </Tooltip>
              ))}
              {participants.length > 4 && (
                <div className="w-8 h-8 -ml-2 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-400">
                  +{participants.length - 4}
                </div>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-200">
                  <LogOut className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-zinc-100">Leave Room?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Are you sure you want to leave this study room? You can rejoin later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLeave}
                    disabled={leaving}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {leaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center justify-center gap-2 py-2">
            <Button
              variant={mode === "code" ? "default" : "ghost"}
              onClick={() => setMode("code")}
              className={cn(
                "rounded-full px-6",
                mode === "code" ? "bg-blue-600" : "text-zinc-400"
              )}
            >
              <Code2 className="w-4 h-4 mr-2" />
              Code Editor
            </Button>
            <Button
              variant={mode === "whiteboard" ? "default" : "ghost"}
              onClick={() => setMode("whiteboard")}
              className={cn(
                "rounded-full px-6",
                mode === "whiteboard" ? "bg-blue-600" : "text-zinc-400"
              )}
            >
              <PenLine className="w-4 h-4 mr-2" />
              Whiteboard
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {mode === "code" ? (
            <CodeEditorPanel
              roomId={roomId}
              currentUser={currentUser}
              initialCode={room.codeSnapshot?.code}
              initialLanguage={room.codeSnapshot?.language}
            />
          ) : (
            <WhiteboardPanel
              roomId={roomId}
              currentUser={currentUser}
              store={whiteboardStoreRef.current}
            />
          )}
        </div>

        {canDelete && (
          <div className="fixed bottom-4 right-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Room
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-zinc-100">Delete Room?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    This action cannot be undone. The room will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
