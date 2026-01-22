"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useUIStore } from "@/store/uiStore";
import { Phone, Video, X } from "lucide-react";

export function ContactInfo() {
  const { user } = useAuthStore();
  const { selectedRoom } = useChatStore();
  const { setShowContactInfo } = useUIStore();

  const otherParticipant = selectedRoom?.participants.find(
    (p) => p.userId !== user?.id,
  );
  const otherUser = otherParticipant?.user;

  const getRandomAvatar = (name: string) => {
    const seed = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=128`;
  };

  const avatarUrl = otherUser ? getRandomAvatar(otherUser.name) : undefined;

  if (!otherUser) return null;

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
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="media"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Link
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Docs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="mt-4">
              <div>
                {/* May Section */}
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  May
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <img
                    src="/Rectangle 26.png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 27.png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 28.png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 29.png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 26 (1).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 27 (1).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 28 (1).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                </div>

                {/* April Section */}
                <div className="mt-4 mb-2 text-sm font-medium text-muted-foreground">
                  April
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <img
                    src="/Rectangle 26 (4).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 26 (5).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 27 (4).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 28 (4).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 29 (3).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                </div>

                {/* March Section */}
                <div className="mt-4 mb-2 text-sm font-medium text-muted-foreground">
                  March
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-2">
                    <img
                      src="/Rectangle 26 (2).png"
                      alt="media"
                      className="h-full w-full object-cover rounded-lg"
                    />
                    <img
                      src="/Rectangle 26 (3).png"
                      alt="media"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  <img
                    src="/Rectangle 27 (2).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover col-span-2 row-span-2"
                  />
                  <img
                    src="/Rectangle 27 (3).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 28 (2).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 28 (3).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                  <img
                    src="/Rectangle 29 (1).png"
                    alt="media"
                    className="aspect-square rounded-lg object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-4 space-y-3">
              {[
                {
                  url: "https://basecamp.net/",
                  title: "Basecamp",
                  description:
                    "Discover thousands of premium UI kits, templates, and design resources tailored for designers, developers, and startups.",
                  icon: "/image 23.png",
                },
                {
                  url: "https://notion.com/",
                  title: "Notion",
                  description:
                    "A new tool that blends your everyday work apps into one. It’s the all-in-one workspace for you and your team.",
                  icon: "/image 26.png",
                },
                {
                  url: "https://asana.com/",
                  title: "Asana",
                  description:
                    "Work anytime, anywhere with Asana. Keep remote and distributed teams, and your entire organization, focused on their goals, projects, and tasks.",
                  icon: "/logo.png",
                },
                {
                  url: "https://trello.com/",
                  title: "Trello",
                  description:
                    "Make the impossible, possible with Trello. The ultimate teamwork project management tool. Start up board in seconds, automate tedious tasks, and collaborate anywhere, even on mobile.",
                  icon: "/logo (1).png",
                },
              ].map((link, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(link.url, "_blank", "noopener,noreferrer");
                  }}
                  className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-accent cursor-pointer"
                >
                  <img
                    src={link.icon}
                    alt={link.title}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium">{link.title}</h4>
                    <p className="text-xs text-muted-foreground">{link.url}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="docs" className="mt-4 space-y-2">
              {[
                {
                  name: "Document Requirement.pdf",
                  size: "16 MB",
                  type: "pdf",
                },
                { name: "User Flow.pdf", size: "32 MB", type: "pdf" },
                { name: "Existing App.fig", size: "213 MB", type: "fig" },
                { name: "Product Illustrations.ai", size: "72 MB", type: "ai" },
                {
                  name: "Quotation-Hikariworks-May.pdf",
                  size: "329 KB",
                  type: "pdf",
                },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <img
                    src={`/logo (${doc.type === "pdf" ? "2" : doc.type === "fig" ? "3" : "4"}).png`}
                    alt={doc.type}
                    className="h-10 w-10 rounded-lg object-contain"
                  />
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
  );
}
