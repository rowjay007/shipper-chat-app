"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft,
  Compass,
  Folder,
  Gift,
  Image,
  MessageCircle,
  PenSquare,
  Star,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export function MiniSidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const getRandomAvatar = (name: string) => {
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=128`;
  };

  const userAvatarUrl = user ? getRandomAvatar(user.name) : undefined;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  const navItems = [
    { icon: "/House (1).png", href: "/", label: "Home" },
    { icon: MessageCircle, href: "/chat", label: "Messages" },
    { icon: Compass, href: "/explore", label: "Explore" },
    { icon: Folder, href: "/files", label: "Files" },
    { icon: Image, href: "/gallery", label: "Gallery" },
  ];

  return (
    <div className="flex w-[76px] flex-shrink-0 flex-col items-center bg-white py-6 px-4 justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="mb-8 flex h-11 w-11 items-center justify-center hover:opacity-80 transition-opacity">
            <img src="/Container.svg" alt="Menu" className="h-11 w-11" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          sideOffset={8}
          alignOffset={88}
          className="w-[307px] p-1 ml-2 rounded-2xl z-[101]"
        >
          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-xl">
            <div className="flex items-center gap-3">
              <ArrowLeft className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Go back to dashboard</span>
            </div>
          </div>
          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-xl">
            <div className="flex items-center gap-3">
              <PenSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Rename file</span>
            </div>
          </div>
          <div className="px-4 py-4 bg-gray-50 rounded-xl mx-1 my-1">
            <div className="text-base font-semibold text-gray-900 mb-1">
              {user?.name || "User"}
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {user?.email || ""}
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500">Credits</span>
                <span className="text-xs text-gray-500">Renews in</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  20 left
                </span>
                <span className="text-2xl font-bold text-gray-900">6h 24m</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className="h-full w-1/5 bg-teal-500 rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">5 of 25 used today</span>
                <span className="text-teal-600 font-medium">+25 tomorrow</span>
              </div>
            </div>
          </div>
          <DropdownMenuItem className="px-4 py-3 rounded-xl">
            <Gift className="mr-3 h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Win free credits</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="px-4 py-3 rounded-xl">
            <Sun className="mr-3 h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Theme Style</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="px-4 py-3 text-red-600 rounded-xl"
          >
            <img src="/logout.png" alt="Logout" className="mr-3 h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item, index) => {
          const isActive =
            item.href === "/chat"
              ? pathname === "/chat" || pathname.startsWith("/chat/")
              : pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all border",
                isActive
                  ? "bg-[#F0FDF4] border-[#1E9A80]"
                  : "border-transparent hover:bg-gray-100"
              )}
              title={item.label}
            >
              {index === 0 ? (
                <img
                  src={item.icon as string}
                  alt={item.label}
                  className="h-6 w-6"
                />
              ) : (
                <item.icon className="h-6 w-6 text-gray-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-4">
        <Link href="/chat/ai">
          <button
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-all border",
              pathname === "/chat/ai"
                ? "bg-[#F0FDF4] border-[#1E9A80] text-teal-600"
                : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )}
            title="AI Chat"
          >
            <Star className="h-6 w-6" />
          </button>
        </Link>

        <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-teal-500 transition-all cursor-pointer">
          <AvatarImage src={userAvatarUrl} alt={user?.name} />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-semibold">
            {user?.name ? getInitials(user.name) : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
