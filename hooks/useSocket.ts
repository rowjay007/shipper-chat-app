"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket/client";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { Message } from "@/types/database";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const { addMessage, addOnlineUser, removeOnlineUser } = useChatStore();

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

  const sendMessage = (content: string, senderId: string) => {
    if (!chatRoomId) return;

    socket.emit("message:send", {
      chatRoomId,
      senderId,
      content,
    });
  };

  const startTyping = (userId: string) => {
    if (!chatRoomId) return;
    socket.emit("typing:start", { chatRoomId, userId });
  };

  const stopTyping = (userId: string) => {
    if (!chatRoomId) return;
    socket.emit("typing:stop", { chatRoomId, userId });
  };

  return { sendMessage, startTyping, stopTyping };
}

