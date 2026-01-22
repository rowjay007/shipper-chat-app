"use client";

import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "@/lib/socket/client";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Message } from "@/types/database";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const {
    addMessage,
    addOnlineUser,
    removeOnlineUser,
    updateMessageReaction,
    setOnlineUsers,
  } = useChatStore();

  useEffect(() => {
    if (!user) return;

    socketRef.current = connectSocket();
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("user:online", user.id);
      addOnlineUser(user.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("onlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    socket.on("user:status", (data: { userId: string; isOnline: boolean }) => {
      if (data.isOnline) {
        addOnlineUser(data.userId);
      } else {
        removeOnlineUser(data.userId);
      }
    });

    socket.on("message:new", (message: Message) => {
      addMessage(message.roomId, message);
    });

    socket.on(
      "reaction:update",
      (data: { messageId: string; reactions: { [key: string]: string[] } }) => {
        const { selectedRoom } = useChatStore.getState();
        if (selectedRoom) {
          updateMessageReaction(
            selectedRoom.id,
            data.messageId,
            data.reactions,
          );
        }
      },
    );

    return () => {
      if (user) {
        socket.emit("user:offline", user.id);
      }
      disconnectSocket();
    };
  }, [user, addMessage, addOnlineUser, removeOnlineUser]);

  return socketRef.current;
}

export function useSocketChat(chatRoomId: string | null) {
  const socket = getSocket();

  useEffect(() => {
    if (!chatRoomId || !socket.connected) return;

    socket.emit("chat:join", chatRoomId);

    return () => {
      socket.emit("chat:leave", chatRoomId);
    };
  }, [chatRoomId, socket]);

  const startTyping = (userId: string) => {
    if (!chatRoomId) return;
    socket.emit("typing:start", { chatRoomId, userId });
  };

  const stopTyping = (userId: string) => {
    if (!chatRoomId) return;
    socket.emit("typing:stop", { chatRoomId, userId });
  };

  return { startTyping, stopTyping };
}
