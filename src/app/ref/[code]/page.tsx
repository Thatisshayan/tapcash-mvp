"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Coins } from "lucide-react";

export default function ReferralLandingPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  useEffect(() => {
    if (code) localStorage.setItem("tapcash_referral_code", code);
    router.replace("/auth/signup");
  }, [code, router]);
  return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
        <Coins className="w-7 h-7 text-black" />
      </div>
      <p className="text-zinc-400 text-sm font-semibold">Setting up your referral…</p>
    </div>
  );
}
