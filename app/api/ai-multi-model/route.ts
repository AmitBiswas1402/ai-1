import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { model, msg, parentModel } = await req.json();
    const apiKey = process.env.STUDIO_API_KEY;

    if (!apiKey) {
      console.error("❌ STUDIO_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "Missing API key configuration" },
        { status: 500 }
      );
    }

    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: msg,
        aiModel: model,
        outputType: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log("✅ AI Response:", response.data);

    return NextResponse.json({
      ...response.data,
      model: parentModel,
    });
  } catch (error: any) {
    console.error("❌ Error in /api/ai-multi-model:", error?.response?.data || error.message);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error?.response?.data || error.message,
      },
      { status: error?.response?.status || 500 }
    );
  }
}
