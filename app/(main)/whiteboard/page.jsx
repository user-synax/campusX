"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import PersonalWhiteboard from "@/components/whiteboard/PersonalWhiteboard";
import { Loader2 } from "lucide-react";

export default function WhiteboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(null);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !isDesktop) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <PersonalWhiteboard />;
}
