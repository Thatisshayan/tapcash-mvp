import Link from "next/link";
import Image from "next/image";
import { Coins, ArrowRight, Shield, Zap, DollarSign, Star, Users, TrendingUp } from "lucide-react";

const OFFERS = [
  { title: "Consumer Habits Survey", reward: 150, type: "Surveys", logo: "https://logo.clearbit.com/surveyjunkie.com", brand: "Survey Junkie" },
  { title: "Raid: Shadow Legends", reward: 800, type: "Games",   logo: "https://logo.clearbit.com/plarium.com",       brand: "Plarium" },
  { title: "Sign Up for Robinhood", reward: 1200, type: "Apps",  logo: "https://logo.clearbit.com/robinhood.com",    brand: "Robinhood" },
];

const STATS = [
  { value: "50,000+", label: "Active Earners" },
  { value: "$2.4M+",  label: "Paid Out" },
  { value: "200+",    label: "Daily Offers" },
  { value: "4.8★",    label: "User Rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#060606]/80 border-b border-zinc-900 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Coins className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-400 tracking-tight">TapCash</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition">Sign In</Link>
            <Link href="/auth/signup" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200">
              Start Earning Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            Earn real money in minutes
          </div>

          <h1 className="text-5xl sm:text-7xl font-black leading-[0.95] tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
              Turn Your Free Time<br />Into Real Cash
            </span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Complete surveys, try apps, and watch videos. Get paid instantly with PayPal, gift cards, or Visa. Join 50,000+ earners already cashing out daily.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/auth/signup" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-lg rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2">
              Start Earning Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/signin" className="px-8 py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-lg rounded-2xl transition-all duration-200">
              Sign In
            </Link>
          </div>

          <p className="text-zinc-600 text-sm">No credit card required · Free forever · Instant signup</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-zinc-900 bg-zinc-950/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-white tracking-tight">{value}</p>
              <p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 space-y-14">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Simple Process</p>
          <h2 className="text-4xl font-black tracking-tight">Earn in 3 easy steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: "01", icon: <Users className="w-6 h-6" />, title: "Create Your Account", desc: "Sign up in 30 seconds with just your email. No credit card, no hidden fees." },
            { n: "02", icon: <TrendingUp className="w-6 h-6" />, title: "Complete Offers",     desc: "Browse hundreds of surveys, games, apps, and videos. Pick what interests you." },
            { n: "03", icon: <DollarSign className="w-6 h-6" />, title: "Get Paid",            desc: "Redeem your coins for PayPal cash, Amazon gift cards, or Visa prepaid cards." },
          ].map(({ n, icon, title, desc }) => (
            <div key={n} className="relative bg-zinc-950/40 border border-zinc-900 rounded-2xl p-7 group hover:border-zinc-700 transition-all duration-300">
              <span className="absolute top-5 right-5 text-5xl font-black text-zinc-900 leading-none select-none">{n}</span>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-5">
                {icon}
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured offers preview */}
      <section className="bg-zinc-950/30 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Offers</p>
            <h2 className="text-4xl font-black tracking-tight">Today's Featured Tasks</h2>
            <p className="text-zinc-500">Join to unlock all 200+ live offers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 pointer-events-none select-none">
            {OFFERS.map((offer) => (
              <div key={offer.title} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0">
                    <Image src={offer.logo} alt={offer.brand} width={40} height={40} className="object-contain" unoptimized />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-semibold">{offer.brand}</p>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{offer.type}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white leading-snug">{offer.title}</p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                  <div className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-lg font-black text-emerald-400">+{offer.reward.toLocaleString()}</span>
                    <span className="text-zinc-600 text-[10px] font-bold uppercase">coins</span>
                  </div>
                  <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs font-bold rounded-lg">Sign in to unlock</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200">
              Unlock All Offers Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 space-y-14">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black tracking-tight">Why TapCash?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Shield className="w-6 h-6" />, title: "Bank-Level Security", desc: "Your data is encrypted with AES-256. We never store card details." },
            { icon: <Zap className="w-6 h-6" />, title: "Instant Rewards", desc: "Coins credited the moment you complete an offer. No waiting periods." },
            { icon: <Star className="w-6 h-6" />, title: "20% Referral Bonus", desc: "Earn 20% of everything your friends make — forever. Passive income." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-7 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">{icon}</div>
              <h3 className="text-base font-extrabold text-white">{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-4 sm:mx-6 mb-16 max-w-5xl lg:mx-auto">
        <div className="relative bg-zinc-950/60 border border-zinc-800 rounded-3xl p-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)]" />
          <div className="relative space-y-5">
            <h2 className="text-4xl font-black tracking-tight">Ready to start earning?</h2>
            <p className="text-zinc-400 text-lg max-w-lg mx-auto">Join 50,000+ earners. Takes 30 seconds. No credit card.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-lg rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-200">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4" />
            © {new Date().getFullYear()} TapCash
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-emerald-500 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
