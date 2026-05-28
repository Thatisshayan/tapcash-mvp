import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid       = searchParams.get("uid") || searchParams.get("user_id");
  const amountStr = searchParams.get("amount");
  const txId      = searchParams.get("tx_id");
  const offerId   = searchParams.get("offer_id");
  const sig       = searchParams.get("sig");

  if (!uid || !amountStr || !txId || !offerId || !sig) return new NextResponse("Missing params", { status: 400 });

  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) return new NextResponse("Invalid amount", { status: 400 });

  const secretKey = process.env.LOOTABLY_SECRET_KEY;
  if (secretKey) {
    const expected = crypto.createHash("md5").update(uid + amount + txId + secretKey).digest("hex");
    if (expected.toLowerCase() !== sig.toLowerCase()) return new NextResponse("Invalid signature", { status: 403 });
  }

  try {
    const txRef = adminDb.collection("transactions").doc(txId);
    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(txRef);
      if (existing.exists) throw new Error("DUPLICATE");

      // Write transaction with schema matching the transactions page
      tx.set(txRef, {
        userId: uid, type: "offerwall_postback", amount, offerId,
        provider: "lootably", status: "completed",
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        createdAt: Timestamp.now(),
      });

      const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await tx.get(userRef);

      // Update wallet.balance (matches frontend read path)
      tx.update(userRef, {
        "wallet.balance": admin.firestore.FieldValue.increment(amount),
        "wallet.lastUpdated": Timestamp.now(),
        totalEarned: admin.firestore.FieldValue.increment(amount),
      });

      // 20% referral commission
      if (userDoc.exists) {
        const referredBy = userDoc.data()?.referredBy;
        if (referredBy) {
          const commission = Math.floor(amount * 0.2);
          const referrerRef = adminDb.collection("users").doc(referredBy);
          tx.update(referrerRef, {
            "wallet.balance": admin.firestore.FieldValue.increment(commission),
            "wallet.lastUpdated": Timestamp.now(),
            referralEarnings: admin.firestore.FieldValue.increment(commission),
          });
          const commRef = adminDb.collection("transactions").doc();
          tx.set(commRef, {
            userId: referredBy, type: "referral_commission", amount: commission,
            offerId, description: "20% commission from referral", status: "completed", createdAt: Timestamp.now(),
          });
        }
      }
    });

    return new NextResponse("1", { status: 200 });
  } catch (err: any) {
    if (err.message === "DUPLICATE") return new NextResponse("1", { status: 200 });
    console.error("Postback error:", err);
    return new NextResponse("error", { status: 500 });
  }
}
