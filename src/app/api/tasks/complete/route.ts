import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const { taskId, amount } = await request.json();
    if (!taskId || !amount || amount <= 0) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const txRef = adminDb.collection("transactions").doc(taskId);

    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(txRef);
      if (existing.exists) throw new Error("DUPLICATE");

      tx.set(txRef, {
        userId: uid, type: "task_complete", amount, status: "completed",
        createdAt: Timestamp.now(),
      });

      const userRef = adminDb.collection("users").doc(uid);
      tx.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(amount),
        "wallet.lastUpdated": Timestamp.now(),
        totalEarned: admin.firestore.FieldValue.increment(amount),
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "DUPLICATE") return NextResponse.json({ success: true });
    console.error("Task complete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
