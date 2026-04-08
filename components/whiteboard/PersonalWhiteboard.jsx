"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { toast } from "sonner";
import {
  Trash2,
  Download,
  Undo,
  Redo,
  ArrowLeft,
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

export default function PersonalWhiteboard() {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const storeRef = useRef(null);
  const router = useRouter();

  const store = useMemo(() => {
    const newStore = createTLStore({
      shapeUtils: defaultShapeUtils,
      bindingUtils: defaultBindingUtils,
    });
    storeRef.current = newStore;
    return newStore;
  }, []);

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    loadWhiteboard();
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (storeRef.current) {
      storeRef.current.clear();
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

  // Load the user's single whiteboard
  const loadWhiteboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/whiteboards');
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error || `Failed to load whiteboard (${res.status})`);
        return;
      }
      const data = await res.json();

      const rawSnapshot = data.snapshot;
      if (!rawSnapshot || typeof rawSnapshot !== 'object') {
        toast.error('Invalid whiteboard format');
        return;
      }

      // Ensure snapshot has proper tldraw v4 structure
      // Handle both old format (document-based) and new format (schemaVersion/store)
      let snapshot;
      if (rawSnapshot.document && rawSnapshot.document.store) {
        // Old format - convert to new format
        snapshot = {
          schemaVersion: (rawSnapshot.document.schema && rawSnapshot.document.schema.schemaVersion) || 2,
          store: rawSnapshot.document.store || {},
          ...(rawSnapshot.session ? { session: rawSnapshot.session } : {}),
        };
      } else {
        // New format or already correct
        snapshot = {
          schemaVersion: rawSnapshot.schemaVersion || 2,
          store: rawSnapshot.store || {},
          ...rawSnapshot
        };
      }

      if (editorRef.current?.loadSnapshot) {
        try {
          editorRef.current.loadSnapshot(snapshot);
        } catch (loadErr) {
          console.error('Snapshot load error:', loadErr);
          toast.error('Failed to load whiteboard format');
        }
      }
    } catch (e) {
      console.error('Load error:', e);
      toast.error('Failed to load whiteboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // No save functionality for now.

  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.history.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.history.redo();
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/feed")}
            className="text-zinc-400 hover:text-zinc-200"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-zinc-700 mx-1" />

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
                  This will erase everything on your canvas.
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

          <div className="flex items-center gap-1 ml-2 border-l border-zinc-700 pl-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              className="text-zinc-400 hover:text-zinc-200"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              className="text-zinc-400 hover:text-zinc-200"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {loading && (
            <div className="text-xs text-zinc-400 mr-2">Loading...</div>
          )}


          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            className="text-zinc-400 hover:text-zinc-200"
            title="Export as PNG"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative overflow-hidden">
        <Tldraw
          store={store}
          onMount={handleMount}
          inferDarkMode
          licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE ?? ""}
        />
      </div>
    </div>
  );
}
