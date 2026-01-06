"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { User } from "@/types/database";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function NewMessageModal() {
  const { user } = useAuthStore();
  const { setSelectedRoom } = useChatStore();
  const { showNewMessageModal, setShowNewMessageModal, setShowContactInfo } =
    useUIStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const getRandomAvatar = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=128`;
  };

  useEffect(() => {
    if (showNewMessageModal && user) {
      loadUsers();
    }
  }, [showNewMessageModal, user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (selectedUser: User) => {
    if (!user) return;

    try {
      const response = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: [selectedUser.id],
          isGroup: false,
        }),
      });

      const data = await response.json();

      if (data.room) {
        const formattedRoom = {
          id: data.room.id,
          type: data.room.type,
          createdAt: data.room.createdAt,
          updatedAt: data.room.updatedAt,
          lastMessageAt: data.room.lastMessageAt,
          participants: data.room.participants.map((p: any) => ({
            id: p.id,
            userId: p.userId,
            roomId: p.roomId,
            joinedAt: p.joinedAt,
            user: p.user,
          })),
          lastMessage: data.room.messages?.[0],
        };

        setSelectedRoom(formattedRoom);
        setShowContactInfo(true);
        setShowNewMessageModal(false);
        return;
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  return (
    <Dialog open={showNewMessageModal} onOpenChange={setShowNewMessageModal}>
      <DialogContent 
        className="bg-white p-0 fixed translate-x-0 translate-y-0"
        style={{
          width: '273px',
          height: '440px',
          padding: '12px',
          borderRadius: '16px',
          border: '1px solid #E8E5DF',
          left: '100px',
          top: '140px',
          zIndex: 1000
        }}
      >
        <DialogHeader className="px-0 pt-0 pb-3 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="px-0 py-3 border-b">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : (
          <ScrollArea className="flex-1" style={{ maxHeight: 'calc(440px - 120px)' }}>
            <div className="px-0 py-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-gray-50"
                  onClick={() => handleUserClick(u)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getRandomAvatar(u.name)} alt={u.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-sm">
                      {getInitials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="truncate text-sm text-gray-500">
                      {u.email}
                    </div>
                  </div>
                  {u.onlineStatus && (
                    <div className="h-2 w-2 rounded-full bg-[#38C793]" />
                  )}
                </div>
              ))}

              {filteredUsers.length === 0 && !loading && (
                <div className="py-8 text-center text-sm text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
