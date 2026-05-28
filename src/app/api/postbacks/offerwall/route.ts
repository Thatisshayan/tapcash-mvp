import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid") || searchParams.get("user_id");
  const amountStr = searchParams.get("amount");
  const txId = searchParams.get("tx_id") || searchParams.get("transaction_id");
  const offerId = searchParams.get("offer_id");

  if (!uid || !amountStr || !txId) return new NextResponse("Missing params", { status: 400 });

  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) return new NextResponse("Invalid amount", { status: 400 });

  try {
    const txRef = adminDb.collection("transactions").doc(txId);
    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(txRef);
      if (existing.exists) throw new Error("DUPLICATE");

      tx.set(txRef, {
        userId: uid, type: "offerwall_postback", amount, offerId: offerId || "unknown",
        status: "completed", createdAt: Timestamp.now(),
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });

      const userRef = adminDb.collection("users").doc(uid);
      tx.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(amount),
        "wallet.lastUpdated": Timestamp.now(),
        totalEarned: admin.firestore.FieldValue.increment(amount),
      });
    });
    return new NextResponse("1", { status: 200 });
  } catch (err: any) {
    if (err.message === "DUPLICATE") return new NextResponse("1", { status: 200 });
    console.error("Offerwall postback error:", err);
    return new NextResponse("error", { status: 500 });
  }
}
