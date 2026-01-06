'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { useSocketChat } from '@/hooks/useSocket'
import { Info, Phone, Search, Video } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MessageBubble } from './messageBubble'
import { MessageInput } from './messageInput'

export function ChatWindow() {
  const { user } = useAuthStore()
  const { selectedRoom, messages, setMessages, onlineUsers } = useChatStore()
  const { showContactInfo, setShowContactInfo } = useUIStore()
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useSocketChat(selectedRoom?.id || null)

  const otherParticipant = selectedRoom?.participants.find(p => p.userId !== user?.id)
  const otherUser = otherParticipant?.user
  const isOnline = otherUser && onlineUsers.has(otherUser.id)

  const getRandomAvatar = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=128`;
  };

  const avatarUrl = otherUser ? getRandomAvatar(otherUser.name) : undefined;

  useEffect(() => {
    if (!selectedRoom) {
      setLoading(false)
      return
    }

    const loadMessages = async () => {
      setLoading(true)
      
      try {
        const response = await fetch(`/api/chat/messages?roomId=${selectedRoom.id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load messages: ${response.status}`)
        }
        
        const data = await response.json()

        if (data.messages) {
          setMessages(selectedRoom.id, data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            roomId: msg.roomId,
            isRead: msg.isRead,
            isAi: msg.isAi,
            metadata: msg.metadata,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
            sender: msg.sender,
          })))
        } else {
          setMessages(selectedRoom.id, [])
        }
      } catch (error) {
        console.error('Error loading messages:', error)
        setMessages(selectedRoom.id, [])
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [selectedRoom, setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[selectedRoom?.id || '']])

  if (!selectedRoom || !otherUser) {
    return (
      <div className="flex flex-1 flex-col bg-[#F3F3EE] overflow-hidden" style={{ maxHeight: '100%', height: '100%' }}>
        <div className="flex items-center justify-between border-b bg-white p-4 flex-shrink-0" style={{ height: '73px' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded bg-gray-200"></div>
            <div className="h-10 w-10 rounded bg-gray-200"></div>
            <div className="h-10 w-10 rounded bg-gray-200"></div>
            <div className="h-10 w-10 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">💬</div>
            <h3 className="text-lg font-semibold">No conversation selected</h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation to start messaging
            </p>
          </div>
        </div>
        <div className="border-t bg-white p-4 flex-shrink-0" style={{ height: '73px' }}>
          <div className="h-10 w-full bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  const roomMessages = messages[selectedRoom.id] || []

  return (
    <div className="flex flex-1 flex-col bg-[#F3F3EE] overflow-hidden" style={{ maxHeight: '100%', height: '100%' }}>
      <div className="flex items-center justify-between border-b bg-white p-4 flex-shrink-0" style={{ height: '73px' }}>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 relative">
            <AvatarImage src={avatarUrl} alt={otherUser.name} />
            <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
            {isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#38C793]" />
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-xs" style={{ color: isOnline ? '#38C793' : '#9CA3AF' }}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowContactInfo(!showContactInfo)}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" style={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading messages...</div>
          </div>
        ) : roomMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {roomMessages.map((message, index) => {
              const showDate = index === 0 || 
                new Date(message.createdAt).toDateString() !== 
                new Date(roomMessages[index - 1].createdAt).toDateString()

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-4 text-center">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {message.createdAt && !isNaN(new Date(message.createdAt).getTime())
                          ? new Date(message.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Today'}
                      </span>
                    </div>
                  )}
                  <MessageBubble message={message} isOwn={message.senderId === user?.id} />
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <MessageInput />
    </div>
  )
}

