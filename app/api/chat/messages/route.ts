import { prisma } from "@/lib/prisma";
import { getIo } from "@/lib/socket/socket-manager";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }

    const participant = await prisma.chatParticipant.findFirst({
      where: {
        roomId: roomId,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
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

    const { chatRoomId, content, attachment } = await request.json();

    if (!chatRoomId || (!content && !attachment)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const messageData: any = {
      roomId: chatRoomId,
      sender_id: user.id,
      content: content,
    };

    if (attachment) {
      messageData.attachmentUrl = attachment.attachmentUrl;
      messageData.attachmentType = attachment.attachmentType;
      messageData.attachmentName = attachment.attachmentName;
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert(messageData)
      .select("*, sender:profiles(*)")
      .single();

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date(), lastMessageAt: new Date() },
    });

    const io = getIo();
    if (io && message) {
      io.to(`chat:${chatRoomId}`).emit("message:new", message);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
