"use client"

import { useState, useEffect, useCallback } from "react"
import { Compass, Users, Calendar, BookOpen, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostsTab from "./components/PostsTab"
import UsersTab from "./components/UsersTab"
import CommunitiesTab from "./components/CommunitiesTab"
import EventsTab from "./components/EventsTab"
import useUser from "@/hooks/useUser"

export default function ExplorePage() {
  const { user: currentUser } = useUser()
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <div className="flex-1 max-w-2xl border-r border-border min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-20">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Explore
            </h1>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Discover personalized content from your campus
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-transparent border-b border-border rounded-none">
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12 text-xs sm:text-sm font-medium"
            >
              <BookOpen className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12 text-xs sm:text-sm font-medium"
            >
              <Users className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger 
              value="communities" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12 text-xs sm:text-sm font-medium"
            >
              <Sparkles className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12 text-xs sm:text-sm font-medium"
            >
              <Calendar className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="posts" className="mt-0">
            <PostsTab currentUser={currentUser} />
          </TabsContent>
          
          <TabsContent value="users" className="mt-0">
            <UsersTab currentUser={currentUser} />
          </TabsContent>
          
          <TabsContent value="communities" className="mt-0">
            <CommunitiesTab currentUser={currentUser} />
          </TabsContent>
          
          <TabsContent value="events" className="mt-0">
            <EventsTab currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
