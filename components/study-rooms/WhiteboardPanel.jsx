"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Tldraw, createTLStore, defaultShapeUtils } from "@tldraw/tldraw";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import {
  Trash2,
  Download,
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { getPusherClient } from "@/lib/pusher-client";
import { cn } from "@/lib/utils";

const CURSOR_COLORS = ["#60a5fa", "#f472b6", "#34d399", "#fb923c", "#a78bfa", "#facc15"];

function CursorOverlay({ remoteCursors }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 999 }}>
      {Object.values(remoteCursors).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-75 ease-linear"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            transform: "translate(-2px, -2px)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path
              d="M0 0 L0 12 L3.5 9 L6 14 L8 13 L5.5 8 L10 8 Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          <span
            style={{
              background: cursor.color,
              color: "white",
              fontSize: "11px",
              padding: "1px 5px",
              borderRadius: "3px",
              whiteSpace: "nowrap",
              marginLeft: "14px",
              marginTop: "-8px",
              display: "block",
            }}
          >
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WhiteboardPanel({ roomId, currentUser, store: externalStore }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [remoteCursors, setRemoteCursors] = useState({});
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [userColor] = useState(() => {
    const hash = currentUser._id?.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
  });

  const internalStoreRef = useRef(null);
  const pusherRef = useRef(null);
  const privateChannelRef = useRef(null);
  const editorRef = useRef(null);
  const cursorThrottleRef = useRef(null);
  const cursorTimeoutRefs = useRef({});

  const activeStore = useMemo(() => {
    return externalStore || (internalStoreRef.current ||= createTLStore({ shapeUtils: defaultShapeUtils }));
  }, [externalStore]);

  const debouncedSaveSnapshot = useMemo(
    () =>
      debounce(async (snapshot) => {
        try {
          await fetch(`/api/study-rooms/${roomId}/sync-canvas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ snapshot: JSON.stringify(snapshot) }),
          });
        } catch (error) {
          console.error("Failed to save canvas snapshot:", error);
        }
      }, 5000),
    [roomId]
  );

  const handleClearCanvas = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.store.clear();
      const snapshot = editorRef.current.store.getSnapshot();
      debouncedSaveSnapshot(snapshot);
      toast.success("Canvas cleared");
    }
    setShowClearDialog(false);
  }, [debouncedSaveSnapshot]);

  useEffect(() => {
    let mounted = true;

    const initPusher = async () => {
      try {
        const pusher = getPusherClient();
        if (!pusher) {
          if (mounted) setConnectionStatus("disconnected");
          return;
        }

        pusherRef.current = pusher;
        const channel = pusher.subscribe(`private-room-${roomId}`);
        privateChannelRef.current = channel;

        channel.bind("pusher:subscription_succeeded", () => {
          if (mounted) setConnectionStatus("connected");
        });

        channel.bind("pusher:subscription_error", () => {
          if (mounted) setConnectionStatus("disconnected");
        });

        channel.bind("client-whiteboard-change", ({ changes, senderId }) => {
          if (!mounted || senderId === currentUser._id || !editorRef.current) return;
          const editorStore = editorRef.current.store;
          editorStore.mergeRemoteChanges(() => {
            const { added, updated, removed } = changes;
            if (added) {
              editorStore.put(Object.values(added));
            }
            if (updated) {
              editorStore.put(Object.values(updated).map(([, next]) => next));
            }
            if (removed) {
              editorStore.remove(Object.values(removed).map((r) => r.id));
            }
          });
        });

        channel.bind("client-whiteboard-snapshot", ({ snapshot, senderId }) => {
          if (!mounted || senderId === currentUser._id || !editorRef.current) return;
          try {
            const parsed = JSON.parse(snapshot);
            editorRef.current.store.loadSnapshot(parsed);
          } catch (e) {
            console.error("Failed to load snapshot:", e);
          }
        });

        channel.bind("client-cursor-move", ({ userId, name, color, x, y }) => {
          if (!mounted || userId === currentUser._id) return;
          setRemoteCursors((prev) => {
            if (cursorTimeoutRefs.current[userId]) {
              clearTimeout(cursorTimeoutRefs.current[userId]);
            }
            cursorTimeoutRefs.current[userId] = setTimeout(() => {
              setRemoteCursors((curr) => {
                const next = { ...curr };
                delete next[userId];
                return next;
              });
            }, 3000);
            return { ...prev, [userId]: { userId, name, color, x, y } };
          });
        });
      } catch (error) {
        console.error("Pusher init error:", error);
        if (mounted) setConnectionStatus("disconnected");
      }
    };

    const loadSnapshot = async () => {
      try {
        const res = await fetch(`/api/study-rooms/${roomId}`);
        const data = await res.json();
        if (data.room?.canvasSnapshot) {
          try {
              const snapshot = JSON.parse(data.room.canvasSnapshot);
              if (mounted && activeStore) {
                activeStore.loadSnapshot(snapshot);
            }
          } catch (e) {
            console.error("Failed to parse snapshot:", e);
          }
        }
      } catch (error) {
        console.error("Failed to load snapshot:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (currentUser) {
      initPusher();
      loadSnapshot();
    }

    return () => {
      mounted = false;
      Object.values(cursorTimeoutRefs.current).forEach(clearTimeout);
    };
  }, [roomId, currentUser._id, currentUser.name, externalStore]);

  useEffect(() => {
    if (!editorRef.current || !privateChannelRef.current || !currentUser) return;

    const editorStore = editorRef.current.store;
    const cleanup = editorStore.listen(
      (entry) => {
        if (entry.source !== "user") return;
        const changes = entry.changes;

        if (privateChannelRef.current) {
          privateChannelRef.current.trigger("client-whiteboard-change", {
            changes,
            senderId: currentUser._id,
          });
        }

        const snapshot = editorStore.getSnapshot();
        debouncedSaveSnapshot(snapshot);
      },
      { scope: "document", source: "user" }
    );

    return cleanup;
  }, [currentUser._id, debouncedSaveSnapshot]);

  const handlePointerMove = useCallback(
    (e) => {
      if (!privateChannelRef.current || !editorRef.current) return;

      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      if (cursorThrottleRef.current) return;
      cursorThrottleRef.current = setTimeout(() => {
        cursorThrottleRef.current = null;
      }, 50);

      privateChannelRef.current.trigger("client-cursor-move", {
        userId: currentUser._id,
        name: currentUser.name,
        color: userColor,
        x,
        y,
      });
    },
    [currentUser._id, currentUser.name, userColor]
  );

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    setLoading(false);
  }, []);

  const handleExport = useCallback(async () => {
    if (!editorRef.current) {
      toast.error("Editor not ready");
      return;
    }
    try {
      const image = await editorRef.current.toImage({ format: "png", background: true });
      const url = URL.createObjectURL(image);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whiteboard-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Whiteboard exported as PNG");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export whiteboard");
    }
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
        <div className="flex items-center gap-2">
          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-200">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-zinc-100">Clear Canvas?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This will erase everything for all participants. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCanvas} className="bg-red-600 hover:bg-red-700">
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleExport} className="text-zinc-400 hover:text-zinc-200">
            <Download className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500">Connected</span>
              </>
            ) : connectionStatus === "connecting" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span className="text-amber-500">Connecting...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-500">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex-1 relative overflow-hidden"
        style={{ background: "#09090b" }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Loading whiteboard...</p>
            </div>
          </div>
        ) : (
          <Tldraw
            store={activeStore}
            onMount={handleMount}
            inferDarkMode
            components={{
              MainMenu: null,
              NavigationPanel: null,
            }}
          />
        )}
        <CursorOverlay remoteCursors={remoteCursors} />
      </div>
    </div>
  );
}
