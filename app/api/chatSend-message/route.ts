import dbConnect from "@/lib/dbConnect";
import ChatMessage from "@/model/ChatMessage";
import ChatSession from "@/model/ChatSession";

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  const { chatSessionId, sender, content } = body;

  try {
    if (!chatSessionId || !sender || !content) {
      return Response.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }
    if (sender !== "anonymous" && sender !== "owner") {
      return Response.json(
        {
          success: false,
          message: "Invalid sender type",
        },
        { status: 400 },
      );
    }
    const session = await ChatSession.findById(chatSessionId);
    if (!session) {
      return Response.json(
        {
          success: false,
          message: "chat session is not found",
        },
        { status: 404 },
      );
    }
    const newMessage = await ChatMessage.create({
      chatSessionId,
      sender,
      content,
    });

    session.lastMessage = content;
    session.lastMessageAt = new Date();
    await session.save();

    return Response.json(
      {
        success: true,
        message: "Message Send Successfully",
        newMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("erro sending message", error);
    return Response.json(
      {
        success: false,
        message: "Error Sending message",
      },
      { status: 500 },
    );
  }
}
