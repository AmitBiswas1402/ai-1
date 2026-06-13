import { db } from "@/config/db";
import { chatTable, frameTable, projectTable, usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { projectId, frameId, messages } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user?.primaryEmailAddress?.emailAddress;

    // ✅ Look up current credits from DB
    const existingUser = await db
      .select()
      .from(usersTable)
      //@ts-ignore
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!existingUser.length) {
      await db.insert(usersTable).values({
        name: user?.fullName ?? "NA",
        email: email!,
        credits: 100,
      });
    } else {
      const currentCredits = existingUser[0].credits ?? 0;
      if (currentCredits <= 0) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
      }
    }

    const userRecord = existingUser.length
      ? existingUser[0]
      : (
          await db
            .select()
            .from(usersTable)
            //@ts-ignore
            .where(eq(usersTable.email, email))
            .limit(1)
        )[0];

    const currentCredits = userRecord.credits ?? 0;

    // ✅ Create project entry
    await db.insert(projectTable).values({
      projectId,
      createdBy: email,
    });

    // ✅ Create frame entry
    await db.insert(frameTable).values({
      frameId: String(frameId),
      projectId,
    });

    // ✅ Store chat messages
    await db.insert(chatTable).values({
      chatMessage: messages,
      frameId: String(frameId),
      createdBy: email,
    });

    // ✅ Decrement credits server-side
    await db
      .update(usersTable)
      .set({
        credits: currentCredits - 1,
      })
      //@ts-ignore
      .where(eq(usersTable.email, email));

    return NextResponse.json({
      projectId,
      frameId,
      messages,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
