import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const BONUS_COINS = 50;

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const userRef = adminDb.collection("users").doc(uid);

    const result = await adminDb.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      if (!userDoc.exists) throw new Error("User not found");

      const data = userDoc.data()!;
      const lastClaimed: Timestamp | undefined = data.dailyBonus?.lastClaimedAt;
      const streak: number = data.dailyBonus?.streak ?? 0;

      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayMidnight = new Date(todayMidnight); yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);

      if (lastClaimed) {
        const lastDate = lastClaimed.toDate();
        const lastMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        if (lastMidnight.getTime() >= todayMidnight.getTime()) {
          throw new Error("ALREADY_CLAIMED");
        }
        const isConsecutive = lastMidnight.getTime() >= yesterdayMidnight.getTime();
        const newStreak = isConsecutive ? streak + 1 : 1;
        const bonus = BONUS_COINS + Math.floor((newStreak - 1) / 7) * 25;

        tx.update(userRef, {
          "wallet.balance": admin.firestore.FieldValue.increment(bonus),
          "wallet.lastUpdated": Timestamp.now(),
          totalEarned: admin.firestore.FieldValue.increment(bonus),
          "dailyBonus.lastClaimedAt": Timestamp.now(),
          "dailyBonus.streak": newStreak,
        });

        const txRef = adminDb.collection("transactions").doc();
        tx.set(txRef, { userId: uid, type: "bonus", amount: bonus, description: `Day ${newStreak} daily bonus`, status: "completed", createdAt: Timestamp.now() });

        return { streak: newStreak, bonus };
      } else {
        tx.update(userRef, {
          "wallet.balance": admin.firestore.FieldValue.increment(BONUS_COINS),
          "wallet.lastUpdated": Timestamp.now(),
          totalEarned: admin.firestore.FieldValue.increment(BONUS_COINS),
          "dailyBonus.lastClaimedAt": Timestamp.now(),
          "dailyBonus.streak": 1,
        });
        const txRef = adminDb.collection("transactions").doc();
        tx.set(txRef, { userId: uid, type: "bonus", amount: BONUS_COINS, description: "Day 1 daily bonus", status: "completed", createdAt: Timestamp.now() });
        return { streak: 1, bonus: BONUS_COINS };
      }
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    if (err.message === "ALREADY_CLAIMED") return NextResponse.json({ error: "Already claimed today" }, { status: 409 });
    console.error("Daily bonus error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
