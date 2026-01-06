'use client'

import { formatMessageTime } from '@/lib/utils'
import { Message } from '@/types/database'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-[#F0FDF4] text-gray-900'
            : 'bg-white text-gray-900'
        )}
      >
        <p className="break-words text-sm">{message.content}</p>
        <div className={cn(
          'mt-1 flex items-center gap-1 text-xs',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          {isOwn && (
            <div className="relative flex-shrink-0 flex items-center" style={{ width: '16px', height: '5.83px', marginRight: '4px' }}>
              <svg 
                width="11.67" 
                height="5.83" 
                viewBox="0 0 12 6" 
                fill="none"
                style={{ position: 'absolute', left: 0 }}
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
                style={{ position: 'absolute', left: '4.33px' }}
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
          <span className="text-gray-500">{formatMessageTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

