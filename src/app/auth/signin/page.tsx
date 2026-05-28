"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try { await signInWithEmailAndPassword(auth, email, password); router.push("/"); }
    catch (err: any) { setError(err.message || "Failed to sign in."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#060606] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#0a0a0a] to-[#060606] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="relative w-full max-w-md bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Coins className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to access your TapCash wallet</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-black font-extrabold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
        <p className="text-zinc-500 text-sm text-center mt-8">Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-emerald-400 font-bold hover:text-emerald-300 transition">Sign Up Free</Link>
        </p>
      </div>
    </div>
  );
}
