"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { toast } from "sonner";
import {
  Trash2,
  Download,
  Wifi,
  WifiOff,
  Users,
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

const CURSOR_COLORS = ["#60a5fa", "#f472b6", "#34d399", "#fb923c", "#a78bfa", "#facc15"];

export default function WhiteboardPanel({ roomId, currentUser }) {
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [remoteCursors, setRemoteCursors] = useState({});
  const [collaborators, setCollaborators] = useState([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [tldrawError, setTldrawError] = useState(null);

  const editorRef = useRef(null);
  const channelRef = useRef(null);
  const userColorRef = useRef(CURSOR_COLORS[0]);
  const hasJoinedRef = useRef(false);
  const lastChangeRef = useRef(0);
  const storeRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const userId = currentUser?._id || "";
  const userName = currentUser?.name || "Anonymous";

  const store = useMemo(() => {
    console.log("[Whiteboard] Creating store...");
    try {
      const newStore = createTLStore({
        shapeUtils: defaultShapeUtils,
        bindingUtils: defaultBindingUtils,
      });
      storeRef.current = newStore;
      console.log("[Whiteboard] Store created:", newStore.constructor.name);
      
      // Set up listener immediately
      newStore.listen((entry) => {
        console.log("[Whiteboard] Store listener:", entry.source, Object.keys(entry.changes).join(","));
        if (entry.source !== "user") return;
        
        const now = Date.now();
        if (now - lastChangeRef.current < 300) return;
        lastChangeRef.current = now;

        if (channelRef.current?.subscribed) {
          console.log("[Whiteboard] Sending changes");
          try {
            channelRef.current.trigger("client-whiteboard-change", {
              changes: entry.changes,
              senderId: userId,
            });
          } catch (e) {
            console.error("[Whiteboard] Trigger error:", e);
          }
        }
      });
      
      return newStore;
    } catch (e) {
      console.error("[Whiteboard] Store creation failed:", e);
      setTldrawError(e.message);
      return null;
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const hash = userId.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
      userColorRef.current = CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    const channelName = `private-room-${roomId}`;

    const initChannel = async () => {
      if (!mounted) return;

      try {
        const pusher = getPusherClient();
        if (!pusher) {
          if (mounted) setConnectionStatus("disconnected");
          return;
        }

        if (pusher.connection.state !== "connected") {
          await new Promise((resolve) => {
            const handler = () => {
              pusher.connection.unbind("connected", handler);
              resolve();
            };
            pusher.connection.bind("connected", handler);
            setTimeout(resolve, 5000);
          });
        }

        if (!mounted) return;

        if (channelRef.current) {
          try {
            pusher.unsubscribe(channelName);
          } catch (e) {}
        }

        const channel = pusher.subscribe(channelName);
        channelRef.current = channel;

        channel.bind("pusher:subscription_succeeded", () => {
          if (!mounted) return;
          console.log("[Whiteboard] Connected!");
          setConnectionStatus("connected");

          if (!hasJoinedRef.current) {
            hasJoinedRef.current = true;
            setTimeout(() => {
              if (channel.subscribed && mounted) {
                channel.trigger("client-whiteboard-joined", {
                  id: userId,
                  name: userName,
                  color: userColorRef.current,
                });
              }
            }, 500);
          }
        });

        channel.bind("pusher:subscription_error", () => {
          if (mounted) setConnectionStatus("disconnected");
        });

        channel.bind("client-whiteboard-joined", (data) => {
          if (!mounted || data.id === userId) return;
          setCollaborators((prev) => {
            if (prev.find((c) => c.id === data.id)) return prev;
            toast.info(`${data.name} joined`);
            return [
              ...prev,
              {
                id: data.id,
                name: data.name,
                color: data.color || CURSOR_COLORS[prev.length % CURSOR_COLORS.length],
              },
            ];
          });
        });

        channel.bind("client-whiteboard-left", (data) => {
          if (!mounted) return;
          setCollaborators((prev) => prev.filter((c) => c.id !== data.id));
          setRemoteCursors((prev) => {
            const next = { ...prev };
            delete next[data.id];
            return next;
          });
        });

        channel.bind("client-whiteboard-change", (data) => {
          console.log("[Whiteboard] Pusher received change event from:", data.senderId, "userId:", userId);
          if (!mounted || data.senderId === userId) {
            console.log("[Whiteboard] Skipping own changes");
            return;
          }
          
          const currentStore = storeRef.current || editorRef.current?.store;
          if (!currentStore) {
            console.log("[Whiteboard] No store ref or editor store");
            return;
          }

          console.log("[Whiteboard] Processing received changes", data.changes);

          try {
            const { added, updated, removed } = data.changes || {};
            console.log("[Whiteboard] Added:", added ? Object.keys(added).length : 0);
            console.log("[Whiteboard] Updated:", updated ? Object.keys(updated).length : 0);
            console.log("[Whiteboard] Removed:", removed ? Object.keys(removed).length : 0);
            
            currentStore.mergeRemoteChanges(() => {
              const toAdd = [];
              const toUpdate = [];
              const toRemove = [];
              
              if (added) {
                Object.values(added).forEach(shape => {
                  if (!currentStore.has(shape.id)) {
                    toAdd.push(shape);
                  }
                });
              }
              
              if (updated) {
                Object.values(updated).forEach(([, newShape]) => {
                  toUpdate.push(newShape);
                });
              }
              
              if (removed) {
                Object.values(removed).forEach(r => {
                  const id = typeof r === 'string' ? r : r.id;
                  toRemove.push(id);
                });
              }
              
              if (toAdd.length) {
                currentStore.put(toAdd);
                console.log("[Whiteboard] Added shapes:", toAdd.length);
              }
              if (toUpdate.length) {
                currentStore.put(toUpdate);
                console.log("[Whiteboard] Updated shapes:", toUpdate.length);
              }
              if (toRemove.length) {
                currentStore.remove(toRemove);
                console.log("[Whiteboard] Removed shapes:", toRemove.length);
              }
            });
            
            console.log("[Whiteboard] Changes applied successfully");
          } catch (e) {
            console.error("[Whiteboard] Merge error:", e);
          }
        });

        channel.bind("client-cursor-move", (data) => {
          if (!mounted || data.userId === userId) return;
          setRemoteCursors((prev) => ({
            ...prev,
            [data.userId]: {
              userId: data.userId,
              name: data.name,
              color: data.color,
              x: data.x,
              y: data.y,
            },
          }));
        });

      } catch (error) {
        console.error("[Whiteboard] Init error:", error);
        if (mounted) setConnectionStatus("disconnected");
      }
    };

    initChannel();

    return () => {
      mounted = false;
      hasJoinedRef.current = false;

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      if (channelRef.current) {
        try {
          if (channelRef.current.subscribed) {
            channelRef.current.trigger("client-whiteboard-left", { id: userId, name: userName });
          }
        } catch (e) {}
        getPusherClient()?.unsubscribe(channelName);
        channelRef.current = null;
      }
    };
  }, [roomId, userId, userName]);

  const handleMount = useCallback((editor) => {
    console.log("[Whiteboard] handleMount called, editor:", editor?.constructor?.name);
    editorRef.current = editor;
    
    if (editor?.store) {
      console.log("[Whiteboard] Editor store:", editor.store.constructor.name);
      
      // If we have an external store, use it
      if (storeRef.current && editor.store !== storeRef.current) {
        console.log("[Whiteboard] Need to sync editor store with our store");
        // For now, use the editor's store
        storeRef.current = editor.store;
      }
      
      // Set up listener on the editor's store
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      unsubscribeRef.current = editor.store.listen((entry) => {
        console.log("[Whiteboard] Store listener:", entry.source, Object.keys(entry.changes).join(","));
        if (entry.source !== "user") return;
        
        const now = Date.now();
        if (now - lastChangeRef.current < 300) return;
        lastChangeRef.current = now;

        if (channelRef.current?.subscribed) {
          console.log("[Whiteboard] Sending changes");
          try {
            channelRef.current.trigger("client-whiteboard-change", {
              changes: entry.changes,
              senderId: userId,
            });
          } catch (e) {
            console.error("[Whiteboard] Trigger error:", e);
          }
        }
      });
    }
  }, [userId]);

  const handleClearCanvas = useCallback(() => {
    const currentStore = storeRef.current || editorRef.current?.store;
    if (currentStore) {
      currentStore.clear();
      toast.success("Canvas cleared");
    }
    setShowClearDialog(false);
  }, []);

  const handleExport = useCallback(async () => {
    if (!editorRef.current) {
      toast.error("Not ready");
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
      toast.success("Exported!");
    } catch (error) {
      toast.error("Export failed");
    }
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!channelRef.current?.subscribed || !userId) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const now = Date.now();
      if (handlePointerMove.lastTriggered && now - handlePointerMove.lastTriggered < 100) return;
      handlePointerMove.lastTriggered = now;

      try {
        channelRef.current.trigger("client-cursor-move", {
          userId,
          name: userName,
          color: userColorRef.current,
          x,
          y,
        });
      } catch (e) {}
    },
    [userId, userName]
  );

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
                  This will erase everything for all participants.
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-500">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-500">Offline</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Users className="w-3.5 h-3.5" />
            <span>{collaborators.length + 1} drawing</span>
          </div>

          {collaborators.length > 0 && (
            <div className="flex items-center gap-1">
              {collaborators.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={handleExport} className="text-zinc-400 hover:text-zinc-200">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        className="flex-1 relative overflow-hidden"
        style={{ background: "#111111" }}
        onPointerMove={handlePointerMove}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          {tldrawError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              Error: {tldrawError}
            </div>
          ) : store ? (
            <Tldraw licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE} onMount={handleMount} inferDarkMode />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Loading...
            </div>
          )}
        </div>

        <div className="absolute inset-0 pointer-events-none z-50">
          {Object.values(remoteCursors).map((cursor) => (
            <div
              key={cursor.userId}
              className="absolute pointer-events-none"
              style={{
                left: cursor.x,
                top: cursor.y,
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
                  marginLeft: "14px",
                  marginTop: "-8px",
                  display: "block",
                  whiteSpace: "nowrap",
                }}
              >
                {cursor.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
