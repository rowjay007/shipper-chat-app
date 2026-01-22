export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: string;
  onlineStatus: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: string;
  type: "direct" | "group" | "ai";
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ChatParticipant {
  id: string;
  roomId: string;
  userId: string;
  joinedAt: string;
  lastReadAt: string;
  isArchived: boolean;
  isMuted: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  roomId: string;
  isRead: boolean;
  isAi: boolean;
  metadata: Record<string, any> | null;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
  reactions?: { [emoji: string]: string[] };
}

export interface AIChat {
  id: string;
  userId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedFile {
  id: string;
  roomId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface RoomWithParticipants extends ChatRoom {
  participants: (ChatParticipant & { user: User })[];
  lastMessage?: Message;
  unreadCount?: number;
}
