'use client'

import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useSocketChat } from '@/hooks/useSocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, Paperclip, Smile, Send } from 'lucide-react'
import { toast } from 'sonner'

const COMMON_EMOJIS = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😢', '😭', '😡', '👍', '👎', '❤️', '🎉', '🔥', '✨', '💯', '🙏']

export function MessageInput() {
  const { user } = useAuthStore()
  const { selectedRoom } = useChatStore()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { sendMessage: sendSocketMessage } = useSocketChat(selectedRoom?.id || null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !selectedRoom || !user) return

    setIsSending(true)

    try {
      sendSocketMessage(message.trim(), user.id)
      setMessage('')
    } catch (error: any) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  const handleEmojiClick = (emoji: string) => {
    const input = inputRef.current
    if (input) {
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0
      const newMessage = message.substring(0, start) + emoji + message.substring(end)
      setMessage(newMessage)
      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setMessage(message + emoji)
    }
    setShowEmoji(false)
  }

  return (
    <form onSubmit={handleSend} className="border-t bg-white p-4 relative flex-shrink-0 flex items-center justify-center" style={{ height: '73px' }}>
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

      <div 
        className="flex items-center bg-white relative"
        style={{
          width: '904px',
          height: '40px',
          gap: '4px',
          borderRadius: '100px',
          border: '1px solid #E8E5DF',
          paddingTop: '12px',
          paddingRight: '4px',
          paddingBottom: '12px',
          paddingLeft: '16px'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type any message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSending}
          className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-gray-400"
          style={{ padding: 0, margin: 0 }}
        />
        
        <button 
          type="button" 
          className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        >
          <Mic className="h-4 w-4" />
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
        >
          <Paperclip className="h-4 w-4" />
        </button>
        
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          onDoubleClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowEmoji(!showEmoji)
          }}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 hover:bg-teal-600 text-white transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}

