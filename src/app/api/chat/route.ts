import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, messages, model = "gpt-3.5-turbo" } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 4096,
    });

    const assistantMessage = response.choices[0]?.message?.content || "";

    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    
    if (error instanceof Error) {
      // Handle OpenAI API errors
      if ("status" in error && typeof (error as { status?: number }).status === "number") {
        const status = (error as { status: number }).status;
        return NextResponse.json(
          { error: error.message || "OpenAI API error" },
          { status }
        );
      }
      
      return NextResponse.json(
        { error: error.message || "Failed to process chat request" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
