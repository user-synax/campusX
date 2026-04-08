"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Copy,
  Play,
  Loader2,
  Users,
  Check,
  Wifi,
  WifiOff,
  X,
  Terminal,
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
  const [remoteCursors, setRemoteCursors] = useState({});
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState([]);
  const [executionError, setExecutionError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const channelRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isReceivingRef = useRef(false);
  const myColorRef = useRef(CURSOR_COLORS[0]);
  const decorationsRef = useRef([]);

  const userId = currentUser?._id || "";
  const userName = currentUser?.name || "Anonymous";
  const userAvatar = currentUser?.avatar || null;

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
    const channelName = `private-room-${roomId}`;

    const initChannel = async () => {
      try {
        const pusher = getPusherClient();
        if (!pusher) {
          if (mounted) setConnectionStatus("disconnected");
          return;
        }

        // Check connection state
        if (pusher.connection.state !== 'connected') {
          console.log("[Pusher] Waiting for connection...");
          await new Promise((resolve) => {
            pusher.connection.bind('connected', resolve);
          });
        }

        if (!mounted) return;

        // Subscribe
        const channel = pusher.subscribe(channelName);
        channelRef.current = channel;

        // Handle subscription events
        channel.bind("pusher:subscription_succeeded", () => {
          if (!mounted) return;
          console.log("[Pusher] Subscription succeeded");
          setConnectionStatus("connected");
          
          // Announce presence after a brief delay
          const triggerPresence = () => {
            if (channel.subscribed) {
              channel.trigger("client-user-joined", {
                id: userId,
                name: userName,
                avatar: userAvatar,
                color: myColorRef.current,
              });
            }
          };
          
          setTimeout(triggerPresence, 500);
        });

        channel.bind("pusher:subscription_error", (err) => {
          console.error("[Pusher] Subscription error:", err);
          if (mounted) setConnectionStatus("disconnected");
        });

        channel.bind("client-user-joined", (data) => {
          if (!mounted || data.id === userId) return;
          setCollaborators((prev) => {
            if (prev.find((c) => c.id === data.id)) return prev;
            toast.success(`${data.name} joined`);
            return [...prev, {
              id: data.id,
              name: data.name,
              avatar: data.avatar,
              color: data.color || CURSOR_COLORS[prev.length % CURSOR_COLORS.length],
            }];
          });
        });

        channel.bind("client-user-left", (data) => {
          if (!mounted) return;
          setCollaborators((prev) => prev.filter((c) => c.id !== data.id));
          setRemoteCursors((prev) => {
            const next = { ...prev };
            delete next[data.id];
            return next;
          });
        });

        channel.bind("client-code-change", (data) => {
          if (!mounted || data.senderId === userId) return;
          
          isReceivingRef.current = true;
          setCode(data.code || "");
          if (data.language) setLanguage(data.language);
          setStateSaved(false);
          
          if (editorRef.current) {
            const position = editorRef.current.getPosition();
            editorRef.current.setValue(data.code || "");
            if (position) editorRef.current.setPosition(position);
          }
          
          setTimeout(() => { isReceivingRef.current = false; }, 300);
        });

        channel.bind("client-cursor-update", (data) => {
          if (!mounted || data.userId === userId) return;
          console.log("[Pusher] Cursor update from:", data.name, "at line", data.position?.lineNumber);
          setRemoteCursors((prev) => ({
            ...prev,
            [data.userId]: {
              userId: data.userId,
              name: data.name,
              color: data.color,
              position: data.position,
            },
          }));
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
        // Trigger leave event if subscribed
        try {
          if (channelRef.current.subscribed) {
            channelRef.current.trigger("client-user-left", { id: userId, name: userName });
          }
        } catch (e) {}
        
        // Unsubscribe
        getPusherClient()?.unsubscribe(channelName);
        channelRef.current = null;
      }
    };
  }, [roomId, userId, userName, userAvatar]);

  // Update Monaco decorations when remote cursors change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    console.log("[Cursors] Updating decorations for:", Object.keys(remoteCursors).length, "cursors");

    const newDecorations = [];

    Object.values(remoteCursors).forEach((cursor) => {
      if (!cursor.position) return;
      
      try {
        const pos = cursor.position;
        const safePos = model.validatePosition(pos);
        
        console.log("[Cursors] Adding cursor for", cursor.name, "at line", pos.lineNumber);
        
        newDecorations.push({
          range: new monaco.Range(safePos.lineNumber, safePos.column, safePos.lineNumber, safePos.column + 1),
          options: {
            className: `remote-cursor-${cursor.userId}`,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            hoverMessage: { value: cursor.name },
            afterContentClassName: `remote-cursor-label-${cursor.userId}`,
          },
        });
      } catch (e) {
        console.error("[Cursors] Error:", e);
      }
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

    // Add CSS for cursor colors dynamically
    const styleId = 'remote-cursor-styles-' + roomId;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    let css = '';
    Object.values(remoteCursors).forEach((cursor) => {
      css += `
        .remote-cursor-${cursor.userId} {
          position: relative;
        }
        .remote-cursor-${cursor.userId}::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: ${cursor.color};
          animation: cursor-blink 1s infinite;
        }
        .remote-cursor-label-${cursor.userId} {
          content: '${cursor.name}';
          color: white;
          background: ${cursor.color};
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 10px;
          margin-left: 4px;
          white-space: nowrap;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
    });
    styleEl.textContent = css;

  }, [remoteCursors, roomId]);

  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    let lastCursorTrigger = 0;
    const CURSOR_THROTTLE = 100; // Max 10 cursor updates per second

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (!userId) return;

      const now = Date.now();
      if (now - lastCursorTrigger < CURSOR_THROTTLE) return;
      lastCursorTrigger = now;

      try {
        if (channelRef.current?.subscribed) {
          channelRef.current.trigger("client-cursor-update", {
            userId: userId,
            name: userName,
            color: myColorRef.current,
            position: e.position,
          });
        }
      } catch (e) {}
    });

    let lastCodeTrigger = 0;
    const CODE_THROTTLE = 300; // Max ~3 code syncs per second

    // Track content changes
    editor.onDidChangeModelContent(() => {
      if (isReceivingRef.current) return;
      
      const newCode = editor.getValue();
      setCode(newCode);
      setStateSaved(false);

      const now = Date.now();
      if (now - lastCodeTrigger >= CODE_THROTTLE) {
        lastCodeTrigger = now;
        
        try {
          if (channelRef.current?.subscribed) {
            channelRef.current.trigger("client-code-change", {
              code: newCode,
              language,
              senderId: userId,
            });
          }
        } catch (e) {}
      }

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
        } finally {
          setSaving(false);
        }
      }, 2000);
    });
  }, [userId, userName, roomId, language]);

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    setStateSaved(false);

    try {
      if (channelRef.current?.subscribed) {
        channelRef.current.trigger("client-code-change", {
          code: editorRef.current?.getValue() || code,
          language: newLang,
          senderId: userId,
        });
      }
    } catch (e) {}

    try {
      await fetch(`/api/study-rooms/${roomId}/sync-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: newLang }),
      });
      setStateSaved(true);
    } catch (e) {}
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied!");
    } catch {}
  };

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    setShowOutput(true);
    setOutput([]);
    setExecutionError(null);

    try {
      const res = await fetch(`/api/study-rooms/${roomId}/execute-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (data.success) {
        setOutput(data.output || []);
        if (data.output?.length === 0) {
          setOutput(["(No output)"]);
        }
      } else {
        setExecutionError(data.error || "Execution failed");
      }
    } catch (error) {
      setExecutionError("Failed to execute code");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
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
                <><Wifi className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Live</span></>
              ) : (
                <><WifiOff className="w-3.5 h-3.5 text-red-500" /><span className="text-red-500">Offline</span></>
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleExecuteCode}
                  disabled={isExecuting || language !== "javascript"}
                  className={language === "javascript" ? "text-green-500 hover:text-green-400" : "text-zinc-600"}
                >
                  {isExecuting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === "javascript" ? "Run Code" : "Only JS supported"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowOutput(!showOutput)}
                  className={showOutput ? "text-blue-400" : "text-zinc-400"}
                >
                  <Terminal className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Output</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopyCode} className="text-zinc-400 hover:text-zinc-200">
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
          <MonacoEditor
            height={showOutput ? "70%" : "100%"}
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

          {showOutput && (
            <div className="h-[30%] border-t border-zinc-700 bg-zinc-900 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
                <span className="text-xs font-medium text-zinc-400">Output</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-zinc-500 hover:text-zinc-300"
                  onClick={() => setShowOutput(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto px-3 py-2 font-mono text-xs">
                {isExecuting ? (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Running...
                  </div>
                ) : executionError ? (
                  <div className="text-red-400 whitespace-pre-wrap">
                    ❌ Error: {executionError}
                  </div>
                ) : output.length > 0 ? (
                  <div className="space-y-1">
                    {output.map((line, i) => (
                      <div key={i} className="text-zinc-300 whitespace-pre-wrap">{line}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 italic">Run your code to see output</div>
                )}
              </div>
            </div>
          )}
        </div>

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
