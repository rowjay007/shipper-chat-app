import { getIo } from "@/lib/socket/socket-manager";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { emoji } = await request.json();
  const { messageId } = params;

  if (!emoji) {
    return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
  }

  try {
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("reactions")
      .eq("id", messageId)
      .single();

    if (messageError) throw messageError;

    const reactions = (message.reactions as { [key: string]: string[] }) || {};
    const users = reactions[emoji] || [];

    if (users.includes(user.id)) {
      reactions[emoji] = users.filter((id) => id !== user.id);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      reactions[emoji] = [...users, user.id];
    }

    const { data: updatedMessage, error: updateError } = await supabase
      .from("messages")
      .update({ reactions })
      .eq("id", messageId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    const io = getIo();
    if (io) {
      io.to(`chat:${updatedMessage.roomId}`).emit("reaction:update", {
        messageId: updatedMessage.id,
        reactions: updatedMessage.reactions,
      });
    }

    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    console.error("Error updating reaction:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 },
    );
  }
}
