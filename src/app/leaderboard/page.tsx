"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Trophy, Coins, Crown, Medal, TrendingUp } from "lucide-react";

interface Leader { uid: string; displayName: string; totalEarned: number; rank: number; }

const RANK_STYLE: Record<number, { icon: React.ReactNode; ring: string; badge: string }> = {
  1: { icon: <Crown  className="w-5 h-5 text-yellow-400" />, ring: "ring-2 ring-yellow-400/40", badge: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400" },
  2: { icon: <Trophy className="w-5 h-5 text-zinc-300"  />, ring: "ring-2 ring-zinc-400/30",   badge: "bg-zinc-400/10 border-zinc-400/20 text-zinc-300" },
  3: { icon: <Medal  className="w-5 h-5 text-amber-600" />, ring: "ring-2 ring-amber-600/30",  badge: "bg-amber-600/10 border-amber-600/20 text-amber-600" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const q = query(collection(db, "users"), orderBy("totalEarned", "desc"), limit(50));
        const snap = await getDocs(q);
        const list: Leader[] = snap.docs.map((d, i) => ({
          uid: d.id,
          displayName: d.data().displayName || "Anonymous",
          totalEarned: d.data().totalEarned || 0,
          rank: i + 1,
        }));
        setLeaders(list);
        if (user) {
          const idx = list.findIndex((l) => l.uid === user.uid);
          setUserRank(idx >= 0 ? idx + 1 : null);
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaders();
  }, [user]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase rounded-full tracking-widest mb-2">
            <Trophy className="w-3 h-3" />
            Global Rankings
          </div>
          <h1 className="text-3xl font-black tracking-tight">Leaderboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Top coin earners on TapCash — updated live</p>
        </div>

        {/* User rank callout */}
        {user && userRank && (
          <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-bold text-emerald-400">You're ranked <span className="text-white">#{userRank}</span> globally</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-900 shrink-0" />
                <div className="flex-grow space-y-2"><div className="h-4 w-32 bg-zinc-900 rounded" /><div className="h-3 w-20 bg-zinc-900 rounded" /></div>
                <div className="h-5 w-16 bg-zinc-900 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((l, i) => {
                  const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const r = RANK_STYLE[actualRank];
                  const isFirst = actualRank === 1;
                  return (
                    <div key={l.uid} className={`flex flex-col items-center gap-2 p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl ${isFirst ? "scale-105 shadow-lg shadow-yellow-400/5" : ""} ${l.uid === user?.uid ? "border-emerald-500/30" : ""}`}>
                      <div className={`relative w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-black ${r.ring}`}>
                        {getInitials(l.displayName)}
                        <div className="absolute -top-2 -right-2">{r.icon}</div>
                      </div>
                      <p className="text-xs font-bold text-white text-center truncate w-full text-center">{l.displayName.split(" ")[0]}</p>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-emerald-400" />
                        <span className="text-sm font-black text-emerald-400">{l.totalEarned.toLocaleString()}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${r.badge}`}>#{actualRank}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ranks 4–50 */}
            {rest.length > 0 && (
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-900/60">
                {rest.map((l) => (
                  <div key={l.uid} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.01] transition ${l.uid === user?.uid ? "bg-emerald-500/5" : ""}`}>
                    <span className="text-sm font-black text-zinc-600 w-6 text-right shrink-0">#{l.rank}</span>
                    <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-300 shrink-0">
                      {getInitials(l.displayName)}
                    </div>
                    <p className={`flex-grow text-sm font-bold truncate ${l.uid === user?.uid ? "text-emerald-400" : "text-zinc-300"}`}>
                      {l.displayName}{l.uid === user?.uid ? " (you)" : ""}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm font-black text-emerald-400">{l.totalEarned.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leaders.length === 0 && (
              <div className="flex flex-col items-center py-20 gap-3 text-zinc-600">
                <Trophy className="w-10 h-10" />
                <p className="font-semibold text-sm">No earners yet — be the first!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
