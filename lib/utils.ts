import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(
  date: Date | string | null | undefined
): string {
  if (!date) return "Unknown";

  try {
    const now = new Date();
    const messageDate = new Date(date);

    // Check if date is valid
    if (isNaN(messageDate.getTime())) return "Unknown";

    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60)
      return `${diffInMins} min${diffInMins > 1 ? "s" : ""} ago`;
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Unknown";
  }
}

export function formatMessageTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "";

  try {
    const messageDate = new Date(date);

    // Check if date is valid
    if (isNaN(messageDate.getTime())) return "";

    return messageDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting message time:", error);
    return "";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
