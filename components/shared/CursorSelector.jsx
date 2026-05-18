"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCat } from "@/context/CatContext";
import { cn } from "@/lib/utils";

function emojiCursor(emoji, size = 32) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><text y="${size - 4}" font-size="${size - 4}">${emoji}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 4, auto`;
}

const CATEGORIES = [
  {
    name: "Basic",
    options: [
      { id: "default", label: "Default" },
      { id: "pointer", label: "Pointer" },
      { id: "crosshair", label: "Crosshair" },
      { id: "text", label: "Text" },
    ],
  },
  {
    name: "Actions",
    options: [
      { id: "wait", label: "Loading" },
      { id: "progress", label: "Progress" },
      { id: "help", label: "Help" },
      { id: "grab", label: "Grab" },
      { id: "grabbing", label: "Grabbing" },
    ],
  },
  {
    name: "Selection",
    options: [
      { id: "cell", label: "Cell" },
      { id: "copy", label: "Copy" },
      { id: "move", label: "Move" },
      { id: "alias", label: "Alias" },
      { id: "not-allowed", label: "Blocked" },
    ],
  },
  {
    name: "Zoom",
    options: [
      { id: "zoom-in", label: "Zoom In" },
      { id: "zoom-out", label: "Zoom Out" },
    ],
  },
  {
    name: "Resize",
    options: [
      { id: "n-resize", label: "N" },
      { id: "e-resize", label: "E" },
      { id: "s-resize", label: "S" },
      { id: "w-resize", label: "W" },
      { id: "ne-resize", label: "NE" },
      { id: "nw-resize", label: "NW" },
      { id: "se-resize", label: "SE" },
      { id: "sw-resize", label: "SW" },
      { id: "ew-resize", label: "EW" },
      { id: "ns-resize", label: "NS" },
    ],
  },
  {
    name: "Emoji",
    options: [
      { id: "emoji-point-up", label: "👆", cursor: emojiCursor("👆") },
      { id: "emoji-pointer", label: "🖱️", cursor: emojiCursor("🖱️") },
      { id: "emoji-magnify", label: "🔍", cursor: emojiCursor("🔍") },
      { id: "emoji-pencil", label: "✏️", cursor: emojiCursor("✏️") },
      { id: "emoji-heart", label: "❤️", cursor: emojiCursor("❤️") },
      { id: "emoji-star", label: "⭐", cursor: emojiCursor("⭐") },
      { id: "emoji-fire", label: "🔥", cursor: emojiCursor("🔥") },
      { id: "emoji-rocket", label: "🚀", cursor: emojiCursor("🚀") },
      { id: "emoji-ghost", label: "👻", cursor: emojiCursor("👻") },
      { id: "emoji-skull", label: "💀", cursor: emojiCursor("💀") },
      { id: "emoji-diamond", label: "💎", cursor: emojiCursor("💎") },
      { id: "emoji-bomb", label: "💣", cursor: emojiCursor("💣") },
    ],
  },
];

function Preview({ option }) {
  if (option.cursor) {
    return (
      <div
        className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-lg"
        style={{ cursor: option.cursor }}
      >
        {option.label}
      </div>
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center"
      style={{ cursor: option.id }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-current opacity-50" />
    </div>
  );
}

export default function CursorSelector() {
  const { showSelector, setShowSelector, cursorStyle, selectStyle } = useCat();

  return (
    <Dialog open={showSelector} onOpenChange={setShowSelector}>
      <DialogContent className="sm:max-w-xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom Mouse</DialogTitle>
          <DialogDescription>Pick a cursor style — CSS or emoji</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-1">
                {cat.name}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
                {cat.options.map((opt) => {
                  const selected = cursorStyle === (opt.cursor || opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectStyle(opt.cursor || opt.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl border transition-all",
                        selected
                          ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500"
                          : "border-border hover:border-purple-500/50 hover:bg-accent",
                      )}
                    >
                      <Preview option={opt} />
                      <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground leading-tight text-center truncate w-full">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
