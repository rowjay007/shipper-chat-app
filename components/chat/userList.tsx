"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { useEffect, useState } from "react";
import { UserListItem } from "./userListItem";

export function UserList() {
  const { user } = useAuthStore();
  const { rooms, setRooms, onlineUsers, setOnlineUsers } = useChatStore();
  const { searchQuery } = useUIStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadRooms = async () => {
      try {
        const response = await fetch("/api/chat/rooms");
        const data = await response.json();

        if (data.rooms) {
          const formattedRooms = data.rooms.map((room: any) => ({
            id: room.id,
            type: room.type,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            lastMessageAt: room.lastMessageAt,
            participants: room.participants.map((p: any) => ({
              id: p.id,
              userId: p.userId,
              roomId: p.roomId,
              joinedAt: p.joinedAt,
              user: p.user,
            })),
            lastMessage: room.messages?.[0],
          }));
          setRooms(formattedRooms);
        }
      } catch (error) {
        console.error("Error loading rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [user, setRooms]);

  const filteredRooms = rooms.filter((room) => {
    if (!searchQuery) return true;
    const otherUser = room.participants.find((p) => p.userId !== user?.id);
    return otherUser?.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading conversations...
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
      <div className="space-y-1 p-2">
        {filteredRooms.map((room) => (
          <UserListItem key={room.id} room={room} />
        ))}
        {filteredRooms.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No conversations yet. Start a new message!
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
