import { isSpoofedBot } from "@arcjet/inspect";
import { NextResponse } from "next/server";

export async function GET(req) {
  const decision = await aj.protect(req, { requested: 10 });
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too Many Requests", reason: decision.reason },
        { status: 429 }
      );
    } else if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "No bots allowed", reason: decision.reason },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { error: "Forbidden", reason: decision.reason },
        { status: 403 }
      );
    }
  }

  if (decision.ip.isHosting()) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 }
    );
  }

  if (decision.results.some(isSpoofedBot)) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: "Hello world" });
}
