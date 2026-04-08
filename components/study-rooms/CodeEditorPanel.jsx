"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Copy,
  FlaskConical,
  Loader2,
  Users,
  Check,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { getPusherClient } from "@/lib/pusher-client";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const CURSOR_COLORS = ["#60a5fa", "#f472b6", "#34d399", "#fb923c", "#a78bfa", "#facc15"];
const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "rust", label: "Rust" },
];

export default function CodeEditorPanel({ roomId, currentUser, initialCode, initialLanguage }) {
  const [code, setCode] = useState(initialCode || "// Start coding...");
  const [language, setLanguage] = useState(initialLanguage || "javascript");
  const [saving, setSaving] = useState(false);
  const [saved, setStateSaved] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const channelRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isReceivingRef = useRef(false);
  const myColorRef = useRef(CURSOR_COLORS[0]);

  // Extract stable user values
  const userId = currentUser?._id || "";
  const userName = currentUser?.name || "Anonymous";
  const userAvatar = currentUser?.avatar || null;

  // Assign color based on user ID
  useEffect(() => {
    if (userId) {
      const hash = userId.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
      myColorRef.current = CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
    }
  }, [userId]);

  // Initialize Pusher channel
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const initChannel = async () => {
      try {
        const pusher = getPusherClient();
        if (!pusher) {
          console.error("[Pusher] Client not available");
          if (mounted) setConnectionStatus("disconnected");
          return;
        }

        // Unsubscribe if already subscribed
        const existingChannel = pusher.channel(`private-room-${roomId}`);
        if (existingChannel) {
          pusher.unsubscribe(`private-room-${roomId}`);
        }

        console.log("[Pusher] Subscribing to private-room-" + roomId);
        const channel = pusher.subscribe(`private-room-${roomId}`);
        channelRef.current = channel;

        channel.bind("pusher:subscription_succeeded", () => {
          console.log("[Pusher] Subscription succeeded! Channel:", channel.name);
          if (mounted) {
            setConnectionStatus("connected");
            // Small delay to ensure channel is ready
            setTimeout(() => {
              if (channelRef.current) {
                console.log("[Pusher] Triggering user-joined");
                channelRef.current.trigger("client-user-joined", {
                  id: userId,
                  name: userName,
                  avatar: userAvatar,
                  color: myColorRef.current,
                });
              }
            }, 500);
          }
        });

        channel.bind("pusher:subscription_error", (err) => {
          console.error("[Pusher] Subscription error:", err);
          if (mounted) setConnectionStatus("disconnected");
        });

        // User join
        channel.bind("client-user-joined", (data) => {
          if (!mounted || data.id === userId) return;
          console.log("[Pusher] User joined:", data);
          setCollaborators((prev) => {
            if (prev.find((c) => c.id === data.id)) return prev;
            toast.success(`${data.name} joined the session`);
            return [...prev, {
              id: data.id,
              name: data.name,
              avatar: data.avatar,
              color: data.color || CURSOR_COLORS[prev.length % CURSOR_COLORS.length],
            }];
          });
        });

        // User leave
        channel.bind("client-user-left", (data) => {
          if (!mounted) return;
          console.log("[Pusher] User left:", data);
          setCollaborators((prev) => {
            const filtered = prev.filter((c) => c.id !== data.id);
            if (filtered.length !== prev.length) {
              toast.info(`${data.name || "Someone"} left the session`);
            }
            return filtered;
          });
        });

        // Code sync
        channel.bind("client-code-change", (data) => {
          if (!mounted || data.senderId === userId) return;
          console.log("[Pusher] Code change from:", data.senderId);
          
          // Mark as receiving to prevent re-broadcasting
          isReceivingRef.current = true;
          
          // Update state - React will handle updating the editor via value prop
          setCode(data.code || "");
          if (data.language) setLanguage(data.language);
          setStateSaved(false);
          
          // Also directly update the editor to be sure
          if (editorRef.current) {
            const currentValue = editorRef.current.getValue();
            if (currentValue !== data.code) {
              console.log("[Pusher] Updating editor directly");
              const position = editorRef.current.getPosition();
              editorRef.current.setValue(data.code || "");
              if (position) {
                editorRef.current.setPosition(position);
              }
            }
          }
          
          setTimeout(() => { 
            isReceivingRef.current = false; 
          }, 300);
        });

        // Cursor updates
        channel.bind("client-cursor-update", (data) => {
          if (!mounted || data.userId === userId) return;
          updateRemoteCursor(data);
        });

      } catch (error) {
        console.error("[Pusher] Init error:", error);
        if (mounted) setConnectionStatus("disconnected");
      }
    };

    initChannel();

    return () => {
      mounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      if (channelRef.current) {
        channelRef.current.trigger("client-user-left", {
          id: userId,
          name: userName,
        });
        channelRef.current.unsubscribe();
      }
      
      // Clean up all cursor elements
      document.querySelectorAll('[id^="cursor-"]').forEach(el => el.remove());
    };
  }, [roomId, userId, userName, userAvatar]);

  const updateRemoteCursor = (data) => {
    if (!editorRef.current || !monacoRef.current) return;
    
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    const pos = data.position;
    const safePos = model.validatePosition(pos);

    // Create or update cursor element
    let container = document.getElementById(`cursor-${data.userId}`);
    if (!container) {
      container = document.createElement('div');
      container.id = `cursor-${data.userId}`;
      container.style.cssText = `
        position: absolute;
        width: 2px;
        height: 20px;
        background: ${data.color || '#60a5fa'};
        pointer-events: none;
        z-index: 100;
        transition: top 0.05s, left 0.05s;
      `;
      
      const label = document.createElement('div');
      label.id = `cursor-label-${data.userId}`;
      label.style.cssText = `
        position: absolute;
        top: -20px;
        left: 0;
        background: ${data.color || '#60a5fa'};
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        font-family: sans-serif;
        white-space: nowrap;
      `;
      label.textContent = data.name;
      container.appendChild(label);
      
      editor.getDomNode()?.appendChild(container);
    }

    // Calculate pixel position
    const scrollTop = editor.getScrollTop();
    const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
    const scrollLeft = editor.getScrollLeft();
    
    const top = (pos.lineNumber - 1) * lineHeight - scrollTop;
    const left = editor.getScrolledVisibleColumn(pos) * editor.getOption(monaco.editor.EditorOption.fontInfo).typicalHalfwidthCharacterWidth - scrollLeft;

    container.style.top = `${Math.max(0, top)}px`;
    container.style.left = `${Math.max(0, left)}px`;
  };

  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (!channelRef.current || !userId) return;

      channelRef.current.trigger("client-cursor-update", {
        userId: userId,
        name: userName,
        color: myColorRef.current,
        position: e.position,
      });
    });

    // Track content changes - use onDidChangeModelContent for better handling
    editor.onDidChangeModelContent((changes) => {
      if (isReceivingRef.current) {
        console.log("[Editor] Ignoring change (receiving)");
        return;
      }
      
      const newCode = editor.getValue();
      console.log("[Editor] Content changed, length:", newCode.length);
      setCode(newCode);
      setStateSaved(false);

      // Broadcast immediately to other clients
      if (channelRef.current) {
        console.log("[Editor] Broadcasting change to channel");
        try {
          channelRef.current.trigger("client-code-change", {
            code: newCode,
            language,
            senderId: userId,
          });
          console.log("[Editor] Trigger successful");
        } catch (err) {
          console.error("[Editor] Trigger failed:", err);
        }
      } else {
        console.log("[Editor] No channel available");
      }

      // Debounce save to database
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          const res = await fetch(`/api/study-rooms/${roomId}/sync-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: newCode, language }),
          });
          if (res.ok) setStateSaved(true);
        } catch (error) {
          console.error("Save failed:", error);
        } finally {
          setSaving(false);
        }
      }, 2000);
    });
  }, [userId, userName, roomId, language]);

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    setStateSaved(false);

    if (channelRef.current) {
      channelRef.current.trigger("client-code-change", {
        code: editorRef.current?.getValue() || code,
        language: newLang,
        senderId: userId,
      });
    }

    try {
      await fetch(`/api/study-rooms/${roomId}/sync-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: newLang }),
      });
      setStateSaved(true);
    } catch (error) {
      console.error("Language change failed:", error);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied!");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px] bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="text-zinc-300">
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopyCode} className="text-zinc-400 hover:text-zinc-200">
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled className="text-zinc-600">
                  <FlaskConical className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            onMount={handleEditorMount}
            theme="vs-dark"
            loading={
              <div className="flex items-center justify-center h-full text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            }
            options={{
              fontSize: 14,
              fontFamily: "Fira Code, Consolas, monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 8, bottom: 8 },
            }}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-900/80 text-xs text-zinc-500 shrink-0">
          <span className="font-medium uppercase">{language}</span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{collaborators.length + 1} coding</span>
            </div>
            
            {collaborators.length > 0 && (
              <div className="flex items-center gap-1.5">
                {collaborators.slice(0, 5).map((c) => (
                  <div 
                    key={c.id} 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: c.color }} 
                    title={c.name}
                  />
                ))}
                {collaborators.length > 5 && (
                  <span className="text-zinc-400">+{collaborators.length - 5}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {saving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /><span>Saving...</span></>
            ) : saved ? (
              <><Check className="w-3 h-3 text-green-500" /><span>Synced</span></>
            ) : (
              <><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /><span>Editing...</span></>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
