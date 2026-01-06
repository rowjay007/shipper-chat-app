import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.match(/^hey\b/)
  ) {
    return "Hello! How can I assist you today?";
  }

  if (
    lowerMessage.includes("how are you") ||
    lowerMessage.includes("how r u")
  ) {
    return "I'm doing great, thank you for asking! How can I help you?";
  }

  if (
    lowerMessage.includes("what") &&
    (lowerMessage.includes("date") || lowerMessage.includes("today"))
  ) {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return `Today is ${now.toLocaleDateString("en-US", options)}.`;
  }

  if (lowerMessage.includes("what") && lowerMessage.includes("time")) {
    const now = new Date();
    return `The current time is ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.`;
  }

  if (
    lowerMessage.includes("what") &&
    (lowerMessage.includes("day") || lowerMessage.includes("today"))
  ) {
    const now = new Date();
    return `Today is ${now.toLocaleDateString("en-US", { weekday: "long" })}.`;
  }

  if (lowerMessage.includes("what") && lowerMessage.includes("year")) {
    return `The current year is ${new Date().getFullYear()}.`;
  }

  if (lowerMessage.includes("what") && lowerMessage.includes("month")) {
    const now = new Date();
    return `The current month is ${now.toLocaleDateString("en-US", { month: "long" })}.`;
  }

  if (lowerMessage.includes("help") || lowerMessage.includes("assist")) {
    return "I'm here to help! I can tell you the current date, time, day, and answer simple questions. What would you like to know?";
  }

  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return "You're welcome! Is there anything else I can help with?";
  }

  if (
    lowerMessage.includes("bye") ||
    lowerMessage.includes("goodbye") ||
    lowerMessage.includes("see you")
  ) {
    return "Goodbye! Feel free to reach out anytime!";
  }

  if (
    lowerMessage.includes("sleep") ||
    lowerMessage.includes("tired") ||
    lowerMessage.includes("rest")
  ) {
    return "It sounds like you need some rest. Have a good sleep! Feel free to come back anytime.";
  }

  if (
    lowerMessage.includes("who are you") ||
    lowerMessage.includes("what are you")
  ) {
    return "I'm an AI assistant built into this chat application. I can help answer basic questions and have conversations with you!";
  }

  if (
    lowerMessage.includes("your name") ||
    lowerMessage.includes("what's your name")
  ) {
    return "I'm your AI Assistant! You can ask me questions about dates, time, or just chat with me.";
  }

  if (lowerMessage.match(/^(ok|okay|cool|nice|great|good)\b/)) {
    return "Is there anything else I can help you with?";
  }

  const genericResponses = [
    "That's interesting! Can you tell me more about that?",
    "I understand. How can I help you with that?",
    "I see what you mean. What else would you like to know?",
    "Thanks for sharing! What else is on your mind?",
    "I appreciate you telling me that. Is there something specific I can help with?",
    "That's a great point! What would you like to discuss further?",
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const aiResponse = getAIResponse(message);

    await supabase.from("messages").insert({
      content: message,
      sender_id: user.id,
      room_id: null,
      is_ai: true,
      is_read: true,
      metadata: { type: "user_message" },
    });

    await supabase.from("messages").insert({
      content: aiResponse,
      sender_id: user.id,
      room_id: null,
      is_ai: true,
      is_read: true,
      metadata: {
        type: "ai_response",
        model: "simple-ai-enhanced",
      },
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
