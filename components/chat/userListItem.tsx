"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn, formatTimestamp, getInitials, truncateText } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { RoomWithParticipants } from "@/types/database";
import { Archive, MessageCircle, Trash2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UserListItemProps {
  room: RoomWithParticipants;
}

export function UserListItem({ room }: UserListItemProps) {
  const { user } = useAuthStore();
  const { selectedRoom, setSelectedRoom, onlineUsers, updateRoom } =
    useChatStore();
  const { setShowContactInfo } = useUIStore();
  const [swipeX, setSwipeX] = useState(0);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const otherParticipant = room.participants.find((p) => p.userId !== user?.id);
  const otherUser = otherParticipant?.user;
  const isOnline = otherUser && onlineUsers.has(otherUser.id);
  const isSelected = selectedRoom?.id === room.id;
  const isArchived = otherParticipant?.isArchived;
  const isMuted = otherParticipant?.isMuted;
  const isUnread = room.unreadCount && room.unreadCount > 0;

  const handleClick = () => {
    if (swipeX === 0) {
      setSelectedRoom(room);
      setShowContactInfo(true);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showContextMenu]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    setSwipeX(Math.min(Math.max(diff, -100), 100));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (Math.abs(swipeX) < 50) {
      setSwipeX(0);
    } else if (swipeX > 50) {
      setSwipeX(80);
    } else if (swipeX < -50) {
      setSwipeX(-80);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const currentX = e.clientX;
    const diff = currentX - startXRef.current;
    setSwipeX(Math.min(Math.max(diff, -100), 100));
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (Math.abs(swipeX) < 50) {
      setSwipeX(0);
    } else if (swipeX > 50) {
      setSwipeX(80);
    } else if (swipeX < -50) {
      setSwipeX(-80);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (Math.abs(swipeX) < 50) {
          setSwipeX(0);
        }
      }
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [swipeX]);

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();

    await supabase
      .from("chat_participants")
      .update({ is_archived: !isArchived })
      .eq("id", otherParticipant?.id);

    updateRoom(room.id, {
      participants: room.participants.map((p) =>
        p.id === otherParticipant?.id ? { ...p, isArchived: !isArchived } : p
      ),
    });

    toast.success(isArchived ? "Unarchived" : "Archived");
  };

  const handleMute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();

    await supabase
      .from("chat_participants")
      .update({ is_muted: !isMuted })
      .eq("id", otherParticipant?.id);

    updateRoom(room.id, {
      participants: room.participants.map((p) =>
        p.id === otherParticipant?.id ? { ...p, isMuted: !isMuted } : p
      ),
    });

    toast.success(isMuted ? "Unmuted" : "Muted");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    const supabase = createClient();
    await supabase.from("chat_rooms").delete().eq("id", room.id);
    toast.success("Conversation deleted");
  };

  const handleMarkRead = async () => {
    setSwipeX(0);
    toast.success("Marked as read");
  };

  const handleArchiveAction = async () => {
    handleArchive({ stopPropagation: () => {} } as any);
    setSwipeX(0);
  };

  if (!otherUser) return null;

  const getRandomAvatar = (name: string) => {
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=128`;
  };

  const avatarUrl = getRandomAvatar(otherUser.name);
  const isRead = room.lastMessage && !isUnread;

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: "352px", height: "64px" }}
    >
      {/* Swipe Actions Background */}
      {swipeX > 0 && (
        <div
          className="absolute inset-y-0 left-0 flex items-center"
          style={{ gap: "8px", paddingLeft: "8px" }}
        >
          <div
            className="rounded-xl bg-[#F0FDF4] flex flex-col items-center justify-center cursor-pointer"
            style={{
              width: "64px",
              height: "64px",
              padding: "12px",
              gap: "8px",
            }}
            onClick={handleMarkRead}
          >
            <img src="/unread.png" alt="Unread" className="w-6 h-6" />
            <span
              className="text-[10px] font-medium text-[#1E9A80]"
              style={{ width: "44px", height: "16px" }}
            >
              Unread
            </span>
          </div>
        </div>
      )}
      {swipeX < 0 && (
        <div
          className="absolute inset-y-0 right-0 flex items-center"
          style={{ gap: "8px", paddingRight: "8px" }}
        >
          <div
            className="rounded-xl bg-[#1E9A80] flex flex-col items-center justify-center cursor-pointer"
            style={{
              width: "64px",
              height: "64px",
              padding: "12px",
              gap: "8px",
            }}
            onClick={handleArchiveAction}
          >
            <img src="/achieve.png" alt="Archive" className="w-6 h-6" />
            <span
              className="text-[10px] font-medium text-white"
              style={{ width: "44px", height: "16px" }}
            >
              Archive
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        ref={itemRef}
        className={cn(
          "relative flex cursor-pointer items-center select-none",
          isArchived && "opacity-50"
        )}
        style={{
          width: "352px",
          height: "64px",
          gap: "12px",
          padding: "12px",
          borderRadius: "12px",
          background: isSelected ? "#E8E5DF" : "#F3F3EE",
          transform: `translateX(${swipeX}px)`,
          transition: isDraggingRef.current
            ? "none"
            : "transform 0.2s ease-out",
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={otherUser.name} />
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-semibold text-sm">
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#38C793]" />
          )}
        </div>

        <div className="flex-1 overflow-hidden min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h4 className="font-medium text-base text-gray-900 truncate">
              {otherUser.name}
            </h4>
            {room.lastMessage && (
              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                {formatTimestamp(room.lastMessage.createdAt)}
              </span>
            )}
          </div>
          {room.lastMessage && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-gray-600 truncate flex-1">
                {truncateText(room.lastMessage.content, 40)}
              </p>
              {isUnread ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-xs text-white font-semibold flex-shrink-0">
                  {room.unreadCount}
                </span>
              ) : isRead ? (
                <div
                  className="relative flex-shrink-0 flex items-center"
                  style={{ width: "16px", height: "5.83px" }}
                >
                  <svg
                    width="11.67"
                    height="5.83"
                    viewBox="0 0 12 6"
                    fill="none"
                    style={{ position: "absolute", left: 0 }}
                  >
                    <path
                      d="M1 3L4.5 5L10.5 1"
                      stroke="#1E9A80"
                      strokeWidth="1.17"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <svg
                    width="11.67"
                    height="5.83"
                    viewBox="0 0 12 6"
                    fill="none"
                    style={{ position: "absolute", left: "4.33px" }}
                  >
                    <path
                      d="M1 3L4.5 5L10.5 1"
                      stroke="#1E9A80"
                      strokeWidth="1.17"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div
                  className="relative flex-shrink-0"
                  style={{ width: "11.67px", height: "5.83px" }}
                >
                  <svg
                    width="11.67"
                    height="5.83"
                    viewBox="0 0 12 6"
                    fill="none"
                  >
                    <path
                      d="M1 3L4.5 5L10.5 1"
                      stroke="#1E9A80"
                      strokeWidth="1.17"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border py-2 z-50"
          style={{
            left: contextMenuPos.x,
            top: contextMenuPos.y,
            minWidth: "200px",
          }}
        >
          <button
            className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu(false);
            }}
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4" />
              <span>Mark as unread</span>
            </div>
          </button>
          <button
            className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm"
            onClick={handleArchive}
          >
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4" />
              <span>{isArchived ? "Unarchive" : "Archive"}</span>
            </div>
          </button>
          <button
            className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm"
            onClick={handleMute}
          >
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4" />
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </div>
            <img src="/right.png" alt="" className="h-3 w-3" />
          </button>
          <button
            className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowContactInfo(true);
              setShowContextMenu(false);
            }}
          >
            <div className="flex items-center gap-3">
              <img src="/user-circle.png" alt="" className="h-4 w-4" />
              <span>Contact info</span>
            </div>
          </button>
          <div className="border-t my-1"></div>
          <button
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu(false);
            }}
          >
            <X className="h-4 w-4" />
            <span>Clear chat</span>
          </button>
          <button
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete chat</span>
          </button>
        </div>
      )}
    </div>
  );
}
