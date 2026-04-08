"use client";

import { Monitor } from "lucide-react";

export default function DesktopOnly() {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-6 z-50">
      <div className="text-center max-w-md">
        <Monitor className="w-12 h-12 text-zinc-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-zinc-200 mb-3">Desktop Only</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Study Rooms require a desktop browser for the best collaborative experience.
          Please open CampusX on your laptop or PC.
        </p>
      </div>
    </div>
  );
}
