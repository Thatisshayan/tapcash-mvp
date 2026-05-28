import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { userId, offerId, provider } = await request.json();
    if (!userId || !offerId || !provider) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const oneHourAgo = new Date(); oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const recentClicks = await adminDb.collection("clicks")
      .where("userId", "==", userId)
      .where("timestamp", ">=", Timestamp.fromDate(oneHourAgo))
      .count().get();

    if (recentClicks.data().count >= 50) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ref = await adminDb.collection("clicks").add({
      userId, offerId, provider, ip,
      userAgent: request.headers.get("user-agent") || "unknown",
      timestamp: Timestamp.now(), status: "clicked",
    });

    return NextResponse.json({ success: true, clickId: ref.id });
  } catch (err) {
    console.error("Click error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
