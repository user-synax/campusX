"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCat } from "@/context/CatContext";

export default function CursorSelector() {
  const { showSelector, setShowSelector } = useCat();

  return (
    <Dialog open={showSelector} onOpenChange={setShowSelector}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom Mouse</DialogTitle>
          <DialogDescription>Pick a cursor style</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
