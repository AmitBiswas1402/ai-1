import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {model, msg, parentModel} = await req.json();

  const response = await axios.post(
    "https://kravixstudio.com/api/v1/chat",
    {
      message: msg,
      aiModel: model,
      outputType: "text", // 'text' or 'json'
    },
    {
      headers: {
        "Content-Type": "application/json", // Tell server we're sending JSON
        Authorization: "Bearer " + process.env.STUDIO_API_KEY, // Replace with your API key
      },
    }
  );

  console.log(response.data); // Log API response
  return NextResponse.json({
    ...response.data,
    model: parentModel
  })
}
