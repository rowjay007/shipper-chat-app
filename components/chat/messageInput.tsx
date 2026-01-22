"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Mic, Paperclip, Send, Smile, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const COMMON_EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😊",
  "😎",
  "🤔",
  "😢",
  "😭",
  "😡",
  "👍",
  "👎",
  "❤️",
  "🎉",
  "🔥",
  "✨",
  "💯",
  "🙏",
];

export function MessageInput() {
  const { user } = useAuthStore();
  const { selectedRoom } = useChatStore();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedRoom || !user) return;
    setIsSending(true);
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatRoomId: selectedRoom.id,
          content: message.trim(),
        }),
      });
      setMessage("");
    } catch (error: any) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newMessage =
        message.substring(0, start) + emoji + message.substring(end);
      setMessage(newMessage);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setMessage(message + emoji);
    }
    setShowEmoji(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom || !user) return;

    setIsSending(true);
    toast.info("Uploading file...");

    try {
      const supabase = createClient();
      const filePath = `public/${selectedRoom.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for the attachment.");
      }

      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatRoomId: selectedRoom.id,
          attachment: {
            attachmentUrl: publicUrl,
            attachmentType: file.type,
            attachmentName: file.name,
          },
        }),
      });

      toast.success("File sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file.");
      console.error(error);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          setAudioBlob(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setAudioBlob(null);
        toast.info("Recording started...");
      } catch (error: any) {
        toast.error("Failed to start recording");
        console.error(error);
      }
    }
  };

  const handleSendAudio = async () => {
    if (!audioBlob || !selectedRoom || !user) return;

    setIsSending(true);
    toast.info("Uploading audio...");

    try {
      const supabase = createClient();
      const fileName = `audio_${Date.now()}.webm`;
      const filePath = `public/${selectedRoom.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, audioBlob);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for the attachment.");
      }

      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatRoomId: selectedRoom.id,
          attachment: {
            attachmentUrl: publicUrl,
            attachmentType: "audio/webm",
            attachmentName: fileName,
          },
        }),
      });

      toast.success("Audio sent!");
      setAudioBlob(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload audio.");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="border-t bg-white p-4 relative flex-shrink-0 flex items-center justify-center"
      style={{ height: "73px" }}
    >
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-full left-4 mb-2 bg-white rounded-lg shadow-lg border p-3 grid grid-cols-6 gap-2 z-50">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className="flex items-center bg-white relative"
        style={{
          width: "904px",
          height: "40px",
          gap: "4px",
          borderRadius: "100px",
          border: "1px solid #E8E5DF",
          paddingTop: "12px",
          paddingRight: "4px",
          paddingBottom: "12px",
          paddingLeft: "16px",
        }}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type any message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
          className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-gray-400 h-auto p-0"
        />

        {audioBlob && (
          <div className="flex items-center gap-2 mr-2">
            <audio
              src={URL.createObjectURL(audioBlob)}
              controls
              className="h-8"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={() => setAudioBlob(null)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <button
          type="button"
          className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          onClick={handleMicClick}
        >
          <Mic className={cn("h-4 w-4", isRecording && "text-red-500")} />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          <Smile className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <button
          type={audioBlob ? "button" : "submit"}
          onClick={audioBlob ? handleSendAudio : undefined}
          disabled={isSending || (!message.trim() && !audioBlob)}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowEmoji(!showEmoji);
          }}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
