import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { StreamingMessageChunk } from "@/lib/types/chat.types";

interface AIContext {
  userId: string;
  conversationId: string;
}

// Mock AI service - replace with actual AI integration
const generateAIResponse = async function* (
  userMessage: string,
  _context: AIContext
): AsyncGenerator<StreamingMessageChunk> {
  const responses = [
    "I understand you're looking for financial guidance. ",
    "Let me analyze your situation... ",
    "Based on your profile, I recommend ",
    "creating a structured budget plan. ",
    "Would you like me to show you a budget creation tool?"
  ];

  for (const chunk of responses) {
    yield {
      type: 'content',
      content: chunk
    };
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Simulate component suggestion
  if (userMessage.toLowerCase().includes('budget')) {
    yield {
      type: 'component',
      component: {
        type: 'budget_form',
        props: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        },
        title: 'Create Monthly Budget',
        description: 'Let\'s set up your budget for this month'
      }
    };
  }

  yield {
    type: 'complete'
  };
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const messageId = searchParams.get("messageId");

    if (!conversationId || !messageId) {
      return NextResponse.json(
        { error: "Missing conversationId or messageId" },
        { status: 400 }
      );
    }

    // Validate conversation access
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Get user message
    const { data: userMessage, error: messageError } = await supabase
      .from("messages")
      .select("content")
      .eq("id", messageId)
      .eq("user_id", user.id)
      .single();

    if (messageError || !userMessage) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Create AI message placeholder
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        content: "",
        sender: "ai",
        type: "text"
      })
      .select()
      .single();

    if (aiMessageError || !aiMessage) {
      return NextResponse.json(
        { error: "Failed to create AI message" },
        { status: 500 }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    let fullContent = "";
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const aiGenerator = generateAIResponse(userMessage.content, {
            userId: user.id,
            conversationId
          });

          for await (const chunk of aiGenerator) {
            if (chunk.type === 'content' && chunk.content) {
              fullContent += chunk.content;
              
              // Update message in database
              await supabase
                .from("messages")
                .update({ 
                  content: fullContent,
                  updated_at: new Date().toISOString()
                })
                .eq("id", aiMessage.id);
            }

            // Send chunk to client
            const chunkData: StreamingMessageChunk = {
              ...chunk,
              messageId: aiMessage.id
            };

            const data = `data: ${JSON.stringify(chunkData)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();

        } catch (error) {
          console.error("Streaming error:", error);
          
          const errorChunk: StreamingMessageChunk = {
            type: 'error',
            error: error instanceof Error ? error.message : "Streaming failed",
            messageId: aiMessage.id
          };

          const data = `data: ${JSON.stringify(errorChunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error("Unexpected error in chat stream:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 