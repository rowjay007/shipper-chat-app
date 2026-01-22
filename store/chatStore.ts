import { Message, RoomWithParticipants, User } from "@/types/database";
import { create } from "zustand";

interface ChatState {
  selectedRoom: RoomWithParticipants | null;
  selectedUser: User | null;
  rooms: RoomWithParticipants[];
  messages: Record<string, Message[]>;
  onlineUsers: Set<string>;
  setSelectedRoom: (room: RoomWithParticipants | null) => void;
  setSelectedUser: (user: User | null) => void;
  setRooms: (rooms: RoomWithParticipants[]) => void;
  addRoom: (room: RoomWithParticipants) => void;
  updateRoom: (roomId: string, updates: Partial<RoomWithParticipants>) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  addMessage: (roomId: string, message: Message) => void;
  updateMessage: (
    roomId: string,
    messageId: string,
    updates: Partial<Message>,
  ) => void;
  updateMessageReaction: (
    roomId: string,
    messageId: string,
    reactions: { [key: string]: string[] },
  ) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedRoom: null,
  selectedUser: null,
  rooms: [],
  messages: {},
  onlineUsers: new Set(),

  setSelectedRoom: (room) => {
    console.log("setSelectedRoom called with:", room);
    set({ selectedRoom: room });
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) =>
    set((state) => ({
      rooms: [room, ...state.rooms.filter((r) => r.id !== room.id)],
    })),

  updateRoom: (roomId, updates) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room,
      ),
      selectedRoom:
        state.selectedRoom?.id === roomId
          ? { ...state.selectedRoom, ...updates }
          : state.selectedRoom,
    })),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    })),

  addMessage: (roomId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), message],
      },
    })),

  updateMessage: (roomId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      },
    })),

  updateMessageReaction: (roomId, messageId, reactions) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, reactions } : msg,
        ),
      },
    })),

  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    })),

  removeOnlineUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    }),

  clearChat: () =>
    set({
      selectedRoom: null,
      selectedUser: null,
      rooms: [],
      messages: {},
      onlineUsers: new Set(),
    }),
}));
