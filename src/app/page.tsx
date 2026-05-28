"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OfferCard from "@/components/OfferCard";
import Header from "@/components/Header";
import { Offer } from "@/types/offer";
import Link from "next/link";
import { Sparkles, Trophy, Flame, ArrowRight, Wallet, Users, Coins, Zap, CheckCircle2, Loader2 } from "lucide-react";

const MOCK_OFFERS: Offer[] = [
  { id: "mock-survey-1", title: "Complete Consumer Habits Survey", description: "Share your daily shopping opinion and earn coins instantly.", payout: 150, clickUrl: "#", provider: "Survey Junkie", category: "Surveys", image: "https://logo.clearbit.com/surveyjunkie.com" },
  { id: "mock-game-1",   title: "Raid: Shadow Legends — Reach Level 40", description: "Build your army in an epic fantasy RPG with stunning graphics.", payout: 800, clickUrl: "#", provider: "Plarium", category: "Games", image: "https://logo.clearbit.com/plarium.com" },
  { id: "mock-video-1",  title: "Watch 3 Video Advertisements", description: "Watch short video ads and earn rewards in the background.", payout: 25, clickUrl: "#", provider: "AdGate", category: "Videos", image: "https://logo.clearbit.com/adgaterewards.com" },
  { id: "mock-app-1",    title: "Install Cash App & Make a Payment", description: "Send money instantly using the Cash App and earn big rewards.", payout: 500, clickUrl: "#", provider: "Cash App", category: "Apps", image: "https://logo.clearbit.com/cash.app" },
  { id: "mock-survey-2", title: "Swagbucks Daily Poll", description: "Answer a quick daily question and collect your coin reward.", payout: 50, clickUrl: "#", provider: "Swagbucks", category: "Surveys", image: "https://logo.clearbit.com/swagbucks.com" },
  { id: "mock-app-2",    title: "Sign Up for Robinhood", description: "Create a free brokerage account and get a bonus stock.", payout: 1200, clickUrl: "#", provider: "Robinhood", category: "Apps", image: "https://logo.clearbit.com/robinhood.com" },
];

export default function OffersPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => { if (snap.exists()) setProfile(snap.data()); }, console.error);
  }, [user]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true); setError(null);
        const uid = user ? user.uid : "preview-user-id";
        const res = await fetch(`/api/offers?userId=${uid}`);
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : data.offers || []);
      } catch (err) {
        setError("Failed to fetch live offers. Showing featured tasks.");
        setOffers(MOCK_OFFERS);
      } finally { setLoading(false); }
    };
    if (!authLoading) fetchOffers();
  }, [user, authLoading]);

  const handleEarn = async (offer: Offer) => {
    if (!user) { alert("Please sign up or sign in to start earning coins!"); return; }
    try {
      await fetch("/api/clicks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.uid, offerId: offer.id, provider: "lootably" }) });
    } catch (err) { console.error("Click log error:", err); }
    if (offer.clickUrl && offer.clickUrl !== "#") window.open(offer.clickUrl, "_blank");
    else alert("In production this redirects to the advertiser tracking URL.");
  };

  const handleDailyBonus = async () => {
    if (!user || claimingBonus || bonusClaimed) return;
    setClaimingBonus(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/daily-bonus", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBonusClaimed(true);
      else if (res.status === 409) setBonusClaimed(true);
    } catch (err) { console.error("Daily bonus error:", err); }
    finally { setClaimingBonus(false); }
  };

  // Check if bonus already claimed today
  const streakData = profile?.dailyBonus;
  const lastClaimed = streakData?.lastClaimedAt?.toDate?.();
  const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
  const alreadyClaimed = bonusClaimed || (lastClaimed && lastClaimed >= todayMidnight);
  const streak = streakData?.streak ?? 0;

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {user ? (
          <div className="space-y-10">
            {/* Dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Welcome card */}
              <div className="lg:col-span-2 relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 flex flex-col justify-between group">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] group-hover:bg-emerald-500/10 transition-all duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" /><span>Welcome Back</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Hello, {profile?.displayName || "Explorer"}!</h1>
                  <p className="text-zinc-400 text-sm mt-2 max-w-lg leading-relaxed">Complete tasks, surveys, or watch videos to fill your coin balance and cash out.</p>
                </div>
                <div className="relative flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-zinc-900/60">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Streak: <strong>{streak > 0 ? `${streak} Days` : "Not started"}</strong></span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span>Earned: <strong>{(profile?.totalEarned || 0).toLocaleString()} coins</strong></span>
                  </div>
                  {/* Daily bonus button */}
                  <button onClick={handleDailyBonus} disabled={alreadyClaimed || claimingBonus}
                    className={`ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${alreadyClaimed ? "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-default" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"}`}>
                    {claimingBonus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : alreadyClaimed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    {alreadyClaimed ? "Bonus Claimed" : "Claim Daily Bonus"}
                  </button>
                </div>
              </div>

              {/* Wallet card */}
              <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 flex flex-col justify-between group">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px]" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-zinc-300">Live Wallet</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Synced</span>
                </div>
                <div className="relative my-6">
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight leading-none">{(profile?.wallet?.balance || 0).toLocaleString()}</p>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5">Available Coins</p>
                </div>
                <div className="relative space-y-2">
                  <Link href="/cashout" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10">
                    <Coins className="w-3.5 h-3.5" />Cash Out Now
                  </Link>
                  <Link href="/referrals" className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />Invite Friends (20% passive)
                  </Link>
                </div>
              </div>
            </div>

            {/* Offers */}
            <div className="space-y-6">
              <div className="flex items-end justify-between border-b border-zinc-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Active Offers</h2>
                  <p className="text-zinc-500 text-sm mt-1">Complete these verified tasks to gain coins</p>
                </div>
                <span className="text-xs font-semibold text-zinc-500">{offers.length} Tasks</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3].map((i) => (
                    <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 animate-pulse space-y-4">
                      <div className="h-5 bg-zinc-900 rounded w-1/3" /><div className="h-7 bg-zinc-900 rounded w-3/4" />
                      <div className="space-y-2"><div className="h-4 bg-zinc-900 rounded w-full" /><div className="h-4 bg-zinc-900 rounded w-5/6" /></div>
                      <div className="h-10 bg-zinc-900 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {error && <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 text-sm">{error}</div>}
                  {offers.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-950/20 border border-zinc-900 border-dashed rounded-3xl">
                      <p className="text-zinc-400 font-bold">No active offers in your region right now.</p>
                      <p className="text-zinc-600 text-sm mt-1">Check back in a few minutes!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {offers.map((offer) => <OfferCard key={offer.id} offer={offer} onEarn={() => handleEarn(offer)} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Hero for unauthenticated */
          <div className="space-y-16 py-8 md:py-16">
            <div className="relative text-center max-w-3xl mx-auto space-y-6">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
              <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />Next-Gen Reward Portal
              </span>
              <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
                Earn Cash Effortlessly Completing Fast Tasks
              </h1>
              <p className="text-zinc-400 text-base sm:text-xl max-w-xl mx-auto leading-relaxed">Complete surveys, try apps, watch videos, and cash out instantly. Join the premium rewards network today.</p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link href="/auth/signup" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2">
                  Start Earning Free<ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/auth/signin" className="px-8 py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-white font-bold text-base rounded-2xl transition">Sign In</Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-8 border-t border-zinc-950">
              {[
                { title: "Create Your Profile", desc: "Sign up with your email in under 30 seconds." },
                { title: "Choose High Payouts", desc: "Select high-value offers from the active wall." },
                { title: "Withdraw Real Coins", desc: "Redeem your coins for direct gift cards or cash." },
              ].map((step, i) => (
                <div key={step.title} className="bg-zinc-950/30 border border-zinc-900/60 p-6 rounded-2xl relative">
                  <span className="absolute top-4 right-4 text-emerald-500/20 text-4xl font-black leading-none">0{i+1}</span>
                  <h3 className="text-lg font-bold text-white mb-1.5">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight">Active Offers Preview</h2>
                <p className="text-zinc-500 text-sm mt-1">Join to complete these tasks and earn payouts</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 grayscale-[40%] pointer-events-none select-none">
                {MOCK_OFFERS.slice(0,3).map((offer) => <OfferCard key={offer.id} offer={offer} onEarn={() => {}} />)}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4" />&copy; {new Date().getFullYear()} TapCash. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-emerald-500 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy</Link>
            <Link href="/landing" className="hover:text-emerald-500 transition">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
