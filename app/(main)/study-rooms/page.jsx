"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import useUser from "@/hooks/useUser";
import DesktopOnly from "@/components/study-rooms/DesktopOnly";
import RoomCard from "@/components/study-rooms/RoomCard";
import CreateRoomModal from "@/components/study-rooms/CreateRoomModal";

export default function StudyRoomsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [isDesktop, setIsDesktop] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (userLoading || !isDesktop) return;

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/study-rooms?filter=${filter}`);
        const data = await res.json();
        if (res.ok) {
          setRooms(data.rooms);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        toast.error("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [filter, userLoading, isDesktop]);

  if (isDesktop === null) return null;
  if (!isDesktop) return <DesktopOnly />;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Study Rooms</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Join a collaborative study room or create your own
            </p>
          </div>

          <CreateRoomModal
            currentUser={user}
            trigger={
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Room
              </Button>
            }
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              All Rooms
            </TabsTrigger>
            <TabsTrigger
              value="my_college"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              My College
            </TabsTrigger>
            <TabsTrigger
              value="my_rooms"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              My Rooms
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-4 border border-zinc-800">
              <BookOpen className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">No rooms found</h3>
            <p className="text-zinc-500 text-sm max-w-md">
              {filter === "all"
                ? "Be the first to create a study room!"
                : filter === "my_college"
                ? "No rooms from your college yet. Create one!"
                : "You haven't created any rooms yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} currentUser={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
