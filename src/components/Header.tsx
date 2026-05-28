"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Coins, LogOut, Menu, X, Users, ArrowRightLeft, ShieldAlert, ArrowUpRight, Trophy } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBalance(data.wallet?.balance ?? 0);
        setIsAdmin(data.isAdmin === true);
      }
    }, (err) => console.error("Header snapshot error:", err));
    return () => unsub();
  }, [user]);

  const handleSignOut = async () => {
    try { await signOut(auth); router.push("/landing"); }
    catch (err) { console.error("Sign out error:", err); }
  };

  const navItems = [
    { name: "Earn Coins",    href: "/",             icon: Coins },
    { name: "Referrals",     href: "/referrals",    icon: Users },
    { name: "Transactions",  href: "/transactions", icon: ArrowRightLeft },
    { name: "Leaderboard",   href: "/leaderboard",  icon: Trophy },
    { name: "Cash Out",      href: "/cashout",      icon: ArrowUpRight },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: ShieldAlert }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 border-b border-zinc-900 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-200">
              <Coins className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-emerald-400 tracking-tight">TapCash</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={name} href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 ${active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"}`}>
                  <Icon className="w-3.5 h-3.5" />{name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: wallet + actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="relative group bg-zinc-950/60 border border-zinc-900 rounded-full py-2 pl-3 pr-4 flex items-center gap-2.5 hover:border-emerald-500/30 transition-all duration-300">
                <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 relative">
                  <Coins className="w-3.5 h-3.5" />
                  <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping opacity-20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">Balance</span>
                  <span className="text-sm font-black text-emerald-400 leading-tight">{balance.toLocaleString()} Coins</span>
                </div>
              </div>
              <button onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-zinc-950 border border-zinc-900 hover:border-red-500/30 hover:text-red-400 text-zinc-400 text-xs font-bold rounded-xl transition-all duration-200">
                <LogOut className="w-3.5 h-3.5" />Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition">Sign In</Link>
              <Link href="/auth/signup" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200">Sign Up Free</Link>
            </div>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-zinc-400 hover:text-white md:hidden">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-[#0a0a0a] px-4 pt-4 pb-6 space-y-1">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link key={name} href={href} onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === href ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 hover:text-white"}`}>
              <Icon className="w-5 h-5" />{name}
            </Link>
          ))}
          {user && (
            <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl text-sm font-bold text-zinc-400 hover:text-red-400 transition">
              <LogOut className="w-5 h-5" />Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
