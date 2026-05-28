"use client";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Clock, CheckCircle2, AlertTriangle, Coins, ShieldAlert, Activity, RefreshCw } from "lucide-react";

interface Withdrawal { id: string; userId: string; amount: number; method: string; status: string; createdAt: any }
interface Postback { id: string; userId: string; amountCents: number; offerId: string; ipAddress: string; status: string; createdAt: any }
interface FlaggedTx { id: string; userId: string; type: string; status: string; createdAt: any }

function fmt(ts: any) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = { completed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", pending: "bg-amber-500/10 border-amber-500/20 text-amber-400", flagged: "bg-red-500/10 border-red-500/20 text-red-400", failed: "bg-zinc-800 border-zinc-700 text-zinc-500" };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-bold capitalize ${map[status] ?? map.failed}`}>{status}</span>;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [postbacks, setPostbacks] = useState<Postback[]>([]);
  const [flagged, setFlagged] = useState<FlaggedTx[]>([]);
  const [stats, setStats] = useState({ pending: 0, postbacks: 0, flags: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [wSnap, pSnap, fSnap] = await Promise.all([
        getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending"), orderBy("createdAt", "desc"), limit(20))),
        getDocs(query(collection(db, "transactions"), where("type", "==", "offerwall_postback"), orderBy("createdAt", "desc"), limit(20))),
        getDocs(query(collection(db, "transactions"), where("status", "==", "flagged"), limit(10))),
      ]);
      setWithdrawals(wSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Withdrawal)));
      setPostbacks(pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Postback)));
      setFlagged(fSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FlaggedTx)));
      setStats({ pending: wSnap.size, postbacks: pSnap.size, flags: fSnap.size });
    } catch (e) { console.error("Admin load error:", e); }
    finally { setLoading(false); setRefreshing(false); }
  }

  async function handleWithdrawal(id: string, action: "approve" | "reject") {
    setActionLoading(id + action);
    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/admin/withdrawals", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ withdrawalId: id, action }) });
      const data = await res.json();
      if (data.success) { setMessage({ text: `Withdrawal ${action}d`, type: "success" }); setWithdrawals((p) => p.filter((w) => w.id !== id)); setStats((s) => ({ ...s, pending: s.pending - 1 })); }
      else setMessage({ text: data.error || "Failed", type: "error" });
    } catch { setMessage({ text: "Network error", type: "error" }); }
    finally { setActionLoading(null); setTimeout(() => setMessage(null), 3000); }
  }

  if (loading) return <div className="min-h-screen bg-[#060606] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header />
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase rounded-full tracking-widest mb-2"><ShieldAlert className="w-3 h-3" />Admin Only</div>
            <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{user?.email}</p>
          </div>
          <button onClick={() => loadData(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white text-sm font-semibold rounded-xl transition disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {message && <div className={`p-4 rounded-xl border text-sm font-medium ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>{message.text}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Pending Withdrawals", value: stats.pending, icon: <Clock className="w-5 h-5" />, color: "text-amber-400", iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
            { label: "Recent Postbacks", value: stats.postbacks, icon: <Activity className="w-5 h-5" />, color: "text-emerald-400", iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
            { label: "Fraud Flags", value: stats.flags, icon: <AlertTriangle className="w-5 h-5" />, color: stats.flags > 0 ? "text-red-400" : "text-zinc-500", iconBg: stats.flags > 0 ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-zinc-800 border-zinc-700 text-zinc-500" },
          ].map(({ label, value, icon, color, iconBg }) => (
            <div key={label} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
              <div><p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p><p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider mt-0.5">{label}</p></div>
            </div>
          ))}
        </div>

        {[
          { title: "Pending Withdrawals", icon: <Coins className="w-5 h-5 text-amber-400" />, count: stats.pending, rows: withdrawals, empty: "No pending withdrawals",
            headers: ["User","Amount","Method","Requested","Actions"],
            row: (w: Withdrawal) => [
              <td key="u" className="px-5 py-4 font-mono text-xs text-zinc-400">{w.userId?.slice(0,12)}…</td>,
              <td key="a" className="px-5 py-4 text-emerald-400 font-black">${((w.amount||0)/100).toFixed(2)}</td>,
              <td key="m" className="px-5 py-4 text-zinc-400 capitalize">{w.method||"—"}</td>,
              <td key="t" className="px-5 py-4 text-zinc-600 text-xs">{fmt(w.createdAt)}</td>,
              <td key="act" className="px-5 py-4"><div className="flex gap-2">
                <button onClick={() => handleWithdrawal(w.id,"approve")} disabled={!!actionLoading} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition disabled:opacity-40">{actionLoading===w.id+"approve"?"…":"Approve"}</button>
                <button onClick={() => handleWithdrawal(w.id,"reject")} disabled={!!actionLoading} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg transition disabled:opacity-40">{actionLoading===w.id+"reject"?"…":"Reject"}</button>
              </div></td>,
            ]
          },
          { title: "Recent Postbacks", icon: <Activity className="w-5 h-5 text-emerald-400" />, count: stats.postbacks, rows: postbacks, empty: "No postbacks yet",
            headers: ["User","Amount","Offer","IP","Status","Time"],
            row: (p: Postback) => [
              <td key="u" className="px-5 py-4 font-mono text-xs text-zinc-400">{p.userId?.slice(0,12)}…</td>,
              <td key="a" className="px-5 py-4 text-emerald-400">${((p.amountCents||0)/100).toFixed(2)}</td>,
              <td key="o" className="px-5 py-4 text-zinc-500 text-xs font-mono">{p.offerId||"—"}</td>,
              <td key="i" className="px-5 py-4 text-zinc-600 text-xs">{p.ipAddress||"—"}</td>,
              <td key="s" className="px-5 py-4"><StatusPill status={p.status} /></td>,
              <td key="t" className="px-5 py-4 text-zinc-600 text-xs">{fmt(p.createdAt)}</td>,
            ]
          },
        ].map(({ title, icon, count, rows, empty, headers, row }) => (
          <section key={title}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">{icon}{title}{count > 0 && <span className="ml-1 px-2 py-0.5 bg-zinc-900 text-zinc-500 text-xs font-bold rounded-full">{count}</span>}</h2>
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden">
              {rows.length === 0 ? <div className="flex items-center justify-center py-14 text-zinc-600 text-sm font-semibold">{empty}</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-zinc-900">{headers.map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-zinc-900/60">{rows.map((r: any) => <tr key={r.id} className="hover:bg-white/[0.015] transition">{row(r)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" />Fraud Flags{flagged.length>0&&<span className="ml-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full">{flagged.length}</span>}</h2>
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden">
            {flagged.length===0 ? <div className="flex items-center justify-center py-14 text-zinc-600 text-sm font-semibold">No suspicious activity detected</div> : (
              <div className="divide-y divide-zinc-900/60">
                {flagged.map((f) => (
                  <div key={f.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-red-500/[0.02] transition">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0"><AlertTriangle className="w-4 h-4" /></div>
                      <div><p className="font-mono text-xs text-zinc-300">{f.userId?.slice(0,16)}…</p><p className="text-zinc-600 text-xs mt-0.5">{f.type}</p></div>
                    </div>
                    <div className="flex items-center gap-3"><StatusPill status={f.status} /><span className="text-zinc-700 text-xs">{fmt(f.createdAt)}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <div className="h-4" />
      </main>
    </div>
  );
}
