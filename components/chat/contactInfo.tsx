'use client'

import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, Video, X } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export function ContactInfo() {
  const { user } = useAuthStore()
  const { selectedRoom } = useChatStore()
  const { setShowContactInfo } = useUIStore()

  const otherParticipant = selectedRoom?.participants.find(p => p.userId !== user?.id)
  const otherUser = otherParticipant?.user

  const getRandomAvatar = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=128`;
  };

  const avatarUrl = otherUser ? getRandomAvatar(otherUser.name) : undefined;

  if (!otherUser) return null

  return (
    <div className="w-96 flex-shrink-0 border-l bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Contact Info</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowContactInfo(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={otherUser.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(otherUser.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-xl font-semibold">{otherUser.name}</h3>
            <p className="text-sm text-muted-foreground">{otherUser.email}</p>

            <div className="mt-6 flex gap-4">
              <Button variant="outline" size="lg" className="flex-1">
                <Phone className="mr-2 h-5 w-5" />
                Audio
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Video className="mr-2 h-5 w-5" />
                Video
              </Button>
            </div>
          </div>

          <Tabs defaultValue="media" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-pink-500 to-purple-500" />
                <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500" />
                <div className="aspect-square rounded-lg bg-gradient-to-br from-orange-500 to-red-500" />
                <div className="aspect-square rounded-lg bg-gradient-to-br from-green-500 to-teal-500" />
                <div className="aspect-square rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500" />
                <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-4 space-y-3">
              {[
                {
                  url: 'https://basecamp.net/',
                  title: 'Basecamp',
                  description: 'Discover thousands of premium UI kits, templates, and design resources...',
                  icon: '🏕️',
                },
                {
                  url: 'https://notion.com/',
                  title: 'Notion',
                  description: 'A new tool that blends your everyday work apps into one...',
                  icon: '📝',
                },
                {
                  url: 'https://asana.com/',
                  title: 'Asana',
                  description: 'Work anytime, anywhere with Asana. Keep remote and distributed teams...',
                  icon: '✓',
                },
                {
                  url: 'https://trello.com/',
                  title: 'Trello',
                  description: 'Make the impossible, possible with Trello. The ultimate teamwork...',
                  icon: '📋',
                },
              ].map((link, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl">
                    {link.icon}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium">{link.title}</h4>
                    <p className="truncate text-xs text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="docs" className="mt-4 space-y-2">
              {[
                { name: 'Document Requirement.pdf', size: '16 MB', type: 'pdf' },
                { name: 'User Flow.pdf', size: '32 MB', type: 'pdf' },
                { name: 'Existing App.fig', size: '213 MB', type: 'fig' },
                { name: 'Product Illustrations.ai', size: '72 MB', type: 'ai' },
                { name: 'Quotation-Hikariworks-May.pdf', size: '329 KB', type: 'pdf' },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <span className="text-xs font-semibold uppercase text-destructive">
                      {doc.type}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="truncate text-sm font-medium">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {doc.size} • {doc.type}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}

