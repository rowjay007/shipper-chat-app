"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { User } from "@/types/database";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserList } from "./userList";

export function ChatSidebar() {
  const { user } = useAuthStore();
  const { setSelectedRoom } = useChatStore();
  const { setShowNewMessageModal, showNewMessageModal, setShowContactInfo } =
    useUIStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const getRandomAvatar = (name: string) => {
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
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
    <div
      className="flex flex-shrink-0 flex-col bg-white overflow-hidden relative"
      style={{
        width: "400px",
        maxWidth: "400px",
        minWidth: "400px",
        height: "932px",
        gap: "24px",
        borderRadius: "24px",
        maxHeight: "100%",
      }}
    >
      {/* All Message Section */}
      <div className="flex-shrink-0 px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-[20px] leading-[30px] font-semibold text-gray-900"
            style={{ fontFamily: "Inter" }}
          >
            All Message
          </h2>
          <Button
            size="sm"
            className="gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-4 rounded-xl"
            onClick={() => setShowNewMessageModal(true)}
          >
            <img src="/pencil-plus.png" alt="New" className="h-4 w-4" />
            New Message
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search in message"
              className="pl-10 pr-2 py-2.5 h-10 bg-gray-50 border border-gray-200 rounded-[10px] text-sm"
              style={{ width: "296px" }}
            />
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-[10px] border border-gray-200 hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* User List - Takes up remaining space */}
      {!showNewMessageModal && (
        <div className="flex-1 overflow-hidden min-h-0">
          <UserList />
        </div>
      )}

      {/* New Message Modal - Positioned directly below New Message button */}
      {showNewMessageModal && (
        <div
          className="absolute bg-white rounded-2xl shadow-lg z-50 flex flex-col"
          style={{
            width: "273px",
            height: "440px",
            padding: "12px",
            borderRadius: "16px",
            border: "1px solid #E8E5DF",
            top: "110px",
            right: "0px",
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b mb-3">
            <h3 className="text-xl font-semibold text-gray-900">New Message</h3>
            <button
              onClick={() => setShowNewMessageModal(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="pb-3 border-b mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
            <ScrollArea
              className="flex-1"
              style={{ maxHeight: "calc(440px - 120px)" }}
            >
              <div className="py-2">
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
        </div>
      )}
    </div>
  );
}
