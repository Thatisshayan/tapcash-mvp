import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { withdrawalId, action, adminNote } = await request.json();
    if (!withdrawalId || !["approve", "reject"].includes(action)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const withdrawalRef = adminDb.collection("withdrawals").doc(withdrawalId);

    await adminDb.runTransaction(async (tx) => {
      const wDoc = await tx.get(withdrawalRef);
      if (!wDoc.exists) throw new Error("Withdrawal not found");
      if (wDoc.data()?.status !== "pending") throw new Error(`Already ${wDoc.data()?.status}`);

      tx.update(withdrawalRef, {
        status: action === "approve" ? "approved" : "rejected",
        reviewedBy: decoded.email, reviewedAt: Timestamp.now(), adminNote: adminNote || null,
      });

      if (action === "reject") {
        const { userId, amount } = wDoc.data()!;
        tx.update(adminDb.collection("users").doc(userId), {
          "wallet.balance": admin.firestore.FieldValue.increment(amount),
          "wallet.lastUpdated": Timestamp.now(),
        });
        // Update the transaction record status
        const txQuery = await adminDb.collection("transactions")
          .where("userId", "==", userId)
          .where("type", "==", "payout")
          .where("status", "==", "pending")
          .limit(1).get();
        if (!txQuery.empty) tx.update(txQuery.docs[0].ref, { status: "failed" });
      } else {
        const { userId } = wDoc.data()!;
        const txQuery = await adminDb.collection("transactions")
          .where("userId", "==", userId)
          .where("type", "==", "payout")
          .where("status", "==", "pending")
          .limit(1).get();
        if (!txQuery.empty) tx.update(txQuery.docs[0].ref, { status: "completed" });
      }

      tx.set(adminDb.collection("adminLogs").doc(), {
        type: `withdrawal_${action}d`, withdrawalId,
        adminEmail: decoded.email, timestamp: Timestamp.now(), note: adminNote || null,
      });
    });

    return NextResponse.json({ success: true, action });
  } catch (err: any) {
    console.error("Admin withdrawal error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
