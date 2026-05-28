"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function SignUpPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const referralCode = generateReferralCode();
      const referredBy = typeof window !== "undefined" ? localStorage.getItem("tapcash_referral_code") ?? undefined : undefined;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, email, displayName: name, referralCode,
        ...(referredBy ? { referredBy } : {}),
        createdAt: serverTimestamp(), totalEarned: 0,
        wallet: { balance: 0, lastUpdated: serverTimestamp() },
      });
      if (typeof window !== "undefined") localStorage.removeItem("tapcash_referral_code");
      router.push("/");
    } catch (err: any) { setError(err.message || "Failed to create account."); }
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
          <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join TapCash to start earning real coins</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSignUp} className="space-y-5">
          {[
            { label: "Full Name", type: "text", value: name, set: setName, placeholder: "John Doe", icon: User },
            { label: "Email Address", type: "email", value: email, set: setEmail, placeholder: "you@example.com", icon: Mail },
            { label: "Password", type: "password", value: password, set: setPassword, placeholder: "••••••••", icon: Lock },
          ].map(({ label, type, value, set, placeholder, icon: Icon }) => (
            <div key={label} className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">{label}</label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <input type={type} required value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-black font-extrabold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign Up Free</span><ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
        <p className="text-zinc-500 text-sm text-center mt-8">Already have an account?{" "}
          <Link href="/auth/signin" className="text-emerald-400 font-bold hover:text-emerald-300 transition">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
