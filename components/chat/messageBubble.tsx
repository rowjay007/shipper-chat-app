"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatMessageTime } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Message } from "@/types/database";
import { File } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const [reactions, setReactions] = useState(message.reactions || {});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleReaction = (emoji: string) => {
    if (!user) return;

    const previousReactions = reactions;

    // Optimistic update
    const newReactions = { ...reactions };
    const users = newReactions[emoji] || [];
    if (users.includes(user.id)) {
      newReactions[emoji] = users.filter((id) => id !== user.id);
      if (newReactions[emoji].length === 0) {
        delete newReactions[emoji];
      }
    } else {
      newReactions[emoji] = [...users, user.id];
    }
    setReactions(newReactions);
    setIsPopoverOpen(false);

    // Send request to the backend
    fetch(`/api/chat/messages/${message.id}/react`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji }),
    }).catch((error) => {
      // If the request fails, revert the optimistic update
      console.error("Failed to update reaction:", error);
      setReactions(previousReactions);
    });
  };

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  return (
    <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            onDoubleClick={() => setIsPopoverOpen(true)}
            className={cn(
              "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
              isOwn ? "bg-[#F0FDF4] text-gray-900" : "bg-white text-gray-900",
            )}
          >
            {message.attachmentUrl && (
              <div className="mt-2">
                {message.attachmentType?.startsWith("image/") ? (
                  <img
                    src={message.attachmentUrl}
                    alt={message.attachmentName || "Image attachment"}
                    className="rounded-lg max-w-xs h-auto"
                  />
                ) : message.attachmentType?.startsWith("audio/") ? (
                  <audio
                    controls
                    src={message.attachmentUrl}
                    className="w-full"
                  />
                ) : (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <File className="h-6 w-6 text-gray-500" />
                    <span className="text-sm font-medium truncate">
                      {message.attachmentName || "Download file"}
                    </span>
                  </a>
                )}
              </div>
            )}
            {message.content && (
              <p className="break-words text-sm mt-1">{message.content}</p>
            )}
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                isOwn ? "justify-end" : "justify-start",
              )}
            >
              {isOwn && (
                <div
                  className="relative flex-shrink-0 flex items-center"
                  style={{
                    width: "16px",
                    height: "5.83px",
                    marginRight: "4px",
                  }}
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
              )}
              <span className="text-gray-500">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-2xl p-1 rounded-full hover:bg-accent transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {Object.keys(reactions).length > 0 && (
        <div className="flex gap-1 mt-1 px-2">
          {Object.entries(reactions).map(
            ([emoji, users]) =>
              users.length > 0 && (
                <div
                  key={emoji}
                  className="flex items-center gap-1 text-xs bg-gray-200 rounded-full px-2 py-0.5 cursor-pointer"
                  onClick={() => handleReaction(emoji)}
                >
                  <span>{emoji}</span>
                  <span className="font-medium">{users.length}</span>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
