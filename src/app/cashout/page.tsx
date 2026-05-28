"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import { Coins, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, Clock, Info } from "lucide-react";

const COIN_TO_USD = 0.001;
const MIN_COINS = 5000;

type Method = "paypal" | "amazon" | "visa";

const METHODS: { id: Method; label: string; logo: string; desc: string }[] = [
  { id: "paypal", label: "PayPal",          logo: "https://logo.clearbit.com/paypal.com", desc: "Instant to your PayPal account" },
  { id: "amazon", label: "Amazon Gift",     logo: "https://logo.clearbit.com/amazon.com", desc: "Amazon gift card via email" },
  { id: "visa",   label: "Visa Gift Card",  logo: "https://logo.clearbit.com/visa.com",   desc: "Prepaid Visa delivered digitally" },
];

export default function CashoutPage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("paypal");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) setBalance(snap.data().wallet?.balance ?? 0);
    });
  }, [user]);

  const coins = parseInt(amount || "0", 10);
  const usdValue = (coins * COIN_TO_USD).toFixed(2);
  const canSubmit = coins >= MIN_COINS && coins <= balance && payoutAddress.trim().length > 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit) return;
    setSubmitting(true);
    setResult(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amountCents: coins, method, payoutAddress: payoutAddress.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ ok: true, msg: "Request submitted! You'll receive your payout within 1–3 business days." });
        setAmount(""); setPayoutAddress("");
      } else {
        setResult({ ok: false, msg: data.error || "Something went wrong. Try again." });
      }
    } catch {
      setResult({ ok: false, msg: "Network error. Check your connection and retry." });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-[#060606] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (!user) return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-400 font-semibold">Sign in to cash out</p>
      <Link href="/auth/signin" className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition">Sign In</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header />
      <main className="flex-grow max-w-lg w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Cash Out</h1>
          <p className="text-zinc-500 text-sm mt-1">Convert your coins into real money</p>
        </div>

        {/* Balance */}
        <div className="relative bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px]" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-400 tracking-tight">{balance.toLocaleString()}</p>
              <p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider">Available Coins</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Info className="w-3.5 h-3.5" />
            1,000 coins = $1.00 · Min. cashout: 5,000 coins ($5.00)
          </div>
        </div>

        {result && (
          <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm font-medium ${result.ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {result.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {result.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Method */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Payout Method</label>
            <div className="grid grid-cols-3 gap-3">
              {METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${method === m.id ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                    <Image src={m.logo} alt={m.label} width={40} height={40} className="object-contain" unoptimized />
                  </div>
                  <span className="text-xs font-bold text-center leading-tight">{m.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-600">{METHODS.find((m_) => m_.id === method)?.desc}</p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {method === "paypal" ? "PayPal Email" : "Email Address"}
            </label>
            <input type="email" required value={payoutAddress} onChange={(e) => setPayoutAddress(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount (Coins)</label>
            <div className="relative">
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input type="number" min={MIN_COINS} max={balance} step={100} required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Min. ${MIN_COINS.toLocaleString()}`}
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
            {coins > 0 && (
              <p className="text-xs text-zinc-500">= <span className="text-emerald-400 font-bold">${usdValue}</span>
                {coins > balance && <span className="text-red-400 ml-2">· Exceeds balance</span>}
                {coins < MIN_COINS && <span className="text-amber-400 ml-2">· Below minimum</span>}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              {[5000, 10000, 25000].filter((v) => v <= balance).map((v) => (
                <button key={v} type="button" onClick={() => setAmount(String(v))}
                  className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold rounded-lg transition">
                  {v.toLocaleString()}
                </button>
              ))}
              {balance >= MIN_COINS && (
                <button type="button" onClick={() => setAmount(String(balance))}
                  className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold rounded-lg transition">Max</button>
              )}
            </div>
          </div>

          <button type="submit" disabled={!canSubmit || submitting}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowUpRight className="w-5 h-5" /><span>Request Payout{coins >= MIN_COINS ? ` — $${usdValue}` : ""}</span></>}
          </button>
        </form>

        <div className="flex items-start gap-2.5 p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl text-xs text-zinc-600">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          Payouts are reviewed within 24h and delivered in 1–3 business days. Minimum payout is $5.00.
        </div>
      </main>
    </div>
  );
}
