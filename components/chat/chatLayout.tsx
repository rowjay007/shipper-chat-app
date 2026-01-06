"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hooks/useSocket";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Bell, Search, Settings } from "lucide-react";
import { useEffect } from "react";
import { ChatSidebar } from "./chatSidebar";
import { ChatWindow } from "./chatWindow";
import { ContactInfo } from "./contactInfo";
import { MiniSidebar } from "./miniSidebar";

export function ChatLayout() {
  const { setUser, user } = useAuthStore();
  const { showContactInfo } = useUIStore();
  useSocket();

  const getRandomAvatar = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=128`;
  };

  const userAvatarUrl = user ? getRandomAvatar(user.name) : undefined;

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                id: data.id,
                email: data.email,
                name: data.name,
                avatar: data.avatar,
                provider: data.provider,
                onlineStatus: data.online_status,
                lastSeen: data.last_seen,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
              });
            }
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        window.location.href = "/auth/login";
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <div className="flex h-screen w-full bg-[#F3F3EE] overflow-hidden" style={{ position: 'relative' }}>
      <MiniSidebar />

      <div className="flex flex-1 flex-col overflow-hidden" style={{ maxHeight: '100vh', position: 'relative', width: '100%' }}>
        {/* Top Message Search Bar - Fixed at top, never moves */}
        <div 
          className="flex items-center justify-between bg-white border-b px-6 py-4 mx-3 mt-3 mb-0 shadow-sm flex-shrink-0"
          style={{ 
            height: '76px',
            position: 'relative',
            zIndex: 100,
            borderRadius: 0
          }}
        >
          <div className="flex items-center gap-3">
            <img src="/message.png" alt="Message" className="h-5 w-5" />
            <h1 className="text-xl font-semibold text-gray-900">Message</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" style={{ width: '300px', height: '32px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" style={{ width: '14px', height: '14px' }} />
              <Input
                type="text"
                placeholder="Search"
                className="border-gray-200 text-sm"
                style={{
                  width: '300px',
                  height: '32px',
                  borderRadius: '10px',
                  borderWidth: '1px',
                  background: '#FFFFFF',
                  paddingTop: '10px',
                  paddingRight: '56px',
                  paddingBottom: '10px',
                  paddingLeft: '36px'
                }}
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center hover:opacity-80 transition-opacity z-10"
                style={{
                  width: '40px',
                  height: '24px',
                  gap: '4px',
                  background: '#F3F3EE',
                  borderRadius: '6px',
                  paddingTop: '5px',
                  paddingRight: '6px',
                  paddingBottom: '5px',
                  paddingLeft: '6px'
                }}
              >
                <img src="/⌘+K.png" alt="⌘+K" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </button>
            </div>
            <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            <img src="/space.png" alt="Space" className="h-5 w-auto" />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={userAvatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-semibold">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <svg 
                width="8" 
                height="4" 
                viewBox="0 0 8 4" 
                fill="none" 
                style={{ position: 'relative', top: '6px', left: '4px' }}
              >
                <path 
                  d="M1 0.5L4 3.5L7 0.5" 
                  stroke="#262626" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Section: All Messages + Main Chat - Constrained to remaining space */}
        <div 
          className="flex gap-3 px-3 py-3"
          style={{ 
            height: 'calc(100vh - 112px)',
            maxHeight: 'calc(100vh - 112px)',
            minHeight: 'calc(100vh - 112px)',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <ChatSidebar />
          <main 
            className="flex flex-col bg-white rounded-2xl shadow-sm" 
            style={{ 
              flex: '1 1 0',
              minWidth: 0,
              maxHeight: '100%',
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
            <ChatWindow />
          </main>
          <div 
            className="flex-shrink-0"
            style={{ 
              width: showContactInfo ? '384px' : '0px',
              overflow: 'hidden',
              transition: 'width 0.2s ease'
            }}
          >
            {showContactInfo && <ContactInfo />}
          </div>
        </div>
      </div>
    </div>
  );
}
