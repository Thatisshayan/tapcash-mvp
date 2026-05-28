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

    const { amountCents, method, payoutAddress } = await request.json();
    if (!amountCents || amountCents <= 0 || !payoutAddress) return NextResponse.json({ error: "Invalid payout request" }, { status: 400 });

    const userRef = adminDb.collection("users").doc(uid);

    await adminDb.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      if (!userDoc.exists) throw new Error("User not found");

      const balance = userDoc.data()?.wallet?.balance ?? 0;
      if (balance < amountCents) throw new Error("Insufficient funds");

      tx.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(-amountCents),
        "wallet.lastUpdated": Timestamp.now(),
      });

      const withdrawalRef = adminDb.collection("withdrawals").doc();
      tx.set(withdrawalRef, {
        userId: uid, amount: amountCents, method: method || "paypal",
        payoutAddress, status: "pending", createdAt: Timestamp.now(),
      });

      const txRef = adminDb.collection("transactions").doc();
      tx.set(txRef, {
        userId: uid, type: "payout", amount: amountCents,
        description: `${method || "paypal"} cashout`, status: "pending", createdAt: Timestamp.now(),
      });

      const auditRef = adminDb.collection("audit").doc();
      tx.set(auditRef, { action: "payout_requested", uid, amountCents, method, timestamp: Timestamp.now() });
    });

    return NextResponse.json({ success: true, message: "Payout request submitted." });
  } catch (err: any) {
    console.error("Payout error:", err);
    return NextResponse.json({ error: err.message || "Failed to process payout" }, { status: 500 });
  }
}
