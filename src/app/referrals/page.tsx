'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Copy, Share2, Users, Coins, Clock, Award, CheckCheck, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

type Referral = { uid: string; joinedDate: string; totalEarned: number; commission: number; isActive: boolean };
type Stats = { totalReferrals: number; totalEarned: number; activeReferrals: number };

export default function ReferralsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ totalReferrals: 0, totalEarned: 0, activeReferrals: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchReferrals(u.uid); else setLoading(false);
    });
  }, []);

  const fetchReferrals = async (uid: string) => {
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('referredBy', '==', uid)));
      const list: Referral[] = []; let totalEarned = 0; let activeCount = 0;
      const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
      snap.forEach((d) => {
        const data = d.data();
        const joinedDate = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
        const userEarned = data.totalEarned || 0;
        const commission = userEarned * 0.2;
        const lastEarned = data.lastEarnedAt?.toDate?.();
        const isActive = !!(lastEarned && lastEarned > thirtyAgo);
        list.push({ uid: d.id, joinedDate, totalEarned: userEarned, commission, isActive });
        totalEarned += commission;
        if (isActive) activeCount++;
      });
      setReferrals(list);
      setStats({ totalReferrals: snap.size, totalEarned, activeReferrals: activeCount });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const referralLink = user ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://tapcash-production.up.railway.app'}/ref/${user.uid}` : '';

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { console.error(e); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Join TapCash', text: 'Earn 20% of what your friends earn — forever!', url: referralLink }); }
      catch (e) { console.error(e); }
    } else handleCopy();
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="min-h-screen bg-[#060606] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-400 font-semibold">Sign in to view your referrals</p>
      <Link href="/auth/signin" className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition">Sign In</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header />
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full tracking-widest"><Zap className="w-3 h-3" />Referral Program</div>
          <h1 className="text-4xl font-black tracking-tight">Earn 20% passive commission</h1>
          <p className="text-zinc-500 text-base max-w-lg">Invite friends to TapCash. Every time they complete a task, you earn 20% of their coins — forever.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Referrals', value: stats.totalReferrals, icon: <Users className="w-5 h-5" />, color: 'text-white', iconBg: 'bg-zinc-800 border-zinc-700 text-zinc-300' },
            { label: 'Passive Commission', value: `${stats.totalEarned.toLocaleString()} coins`, icon: <Coins className="w-5 h-5" />, color: 'text-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
            { label: 'Active Last 30d', value: stats.activeReferrals, icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
          ].map(({ label, value, icon, color, iconBg }) => (
            <div key={label} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
              <div><p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p><p className="text-zinc-600 text-xs font-semibold uppercase tracking-wider mt-0.5">{label}</p></div>
            </div>
          ))}
        </div>

        <div className="relative bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 md:p-8 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Your Unique Referral Link</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-emerald-300 font-mono text-sm break-all select-all">{referralLink}</div>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleCopy} className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-emerald-500 text-black border border-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'}`}>
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleShare} className="flex items-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/10">
                <Share2 className="w-4 h-4" />Share
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /><h2 className="text-base font-bold text-white">Referred Members</h2>
            {referrals.length > 0 && <span className="ml-auto text-xs font-semibold text-zinc-600">{referrals.length} total</span>}
          </div>
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700"><Users className="w-7 h-7" /></div>
              <p className="text-zinc-400 font-semibold text-sm">No referrals yet</p>
              <p className="text-zinc-600 text-xs text-center max-w-xs">Share your link above and you'll see referred members here once they join.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-zinc-900">{['User','Joined','Status','Their Earnings','Your Commission'].map((h) => <th key={h} className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {referrals.map((ref) => (
                    <tr key={ref.uid} className="hover:bg-white/[0.01] transition">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">{ref.uid.slice(0,12)}…</td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">{formatDate(ref.joinedDate)}</td>
                      <td className="px-6 py-4">
                        {ref.isActive
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Active</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs font-semibold rounded-full"><Clock className="w-3 h-3" />Inactive</span>}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-semibold">{ref.totalEarned.toLocaleString()} coins</td>
                      <td className="px-6 py-4 text-emerald-400 font-black">+{ref.commission.toLocaleString()} coins</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
