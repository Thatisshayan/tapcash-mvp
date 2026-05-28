"use client";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, Coins, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronDown, Filter, Gamepad2, FileText, Users, Zap } from "lucide-react";

type TxType = "offerwall_postback"|"task_complete"|"payout"|"referral_commission"|"bonus";
type TxStatus = "completed"|"pending"|"flagged"|"failed";
interface Transaction { id: string; type: TxType; status: TxStatus; amount: number; amountCents?: number; offerId?: string; description?: string; createdAt: any }

const PAGE = 20;
const TYPE_META: Record<TxType, { label: string; icon: React.ReactNode; color: string; iconBg: string }> = {
  offerwall_postback:  { label: "Offer Completed",  icon: <Gamepad2  className="w-4 h-4" />, color: "text-emerald-400", iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  task_complete:       { label: "Task Completed",   icon: <FileText  className="w-4 h-4" />, color: "text-sky-400",     iconBg: "bg-sky-500/10 border-sky-500/20 text-sky-400" },
  payout:              { label: "Cashout",           icon: <ArrowUpRight className="w-4 h-4" />, color: "text-red-400", iconBg: "bg-red-500/10 border-red-500/20 text-red-400" },
  referral_commission: { label: "Referral Bonus",   icon: <Users     className="w-4 h-4" />, color: "text-violet-400", iconBg: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
  bonus:               { label: "Bonus",             icon: <Zap       className="w-4 h-4" />, color: "text-amber-400",  iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
};
const STATUS_META: Record<TxStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  completed: { label: "Completed", cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  pending:   { label: "Pending",   cls: "bg-amber-500/10 border-amber-500/20 text-amber-400",       icon: <Clock className="w-3 h-3" /> },
  flagged:   { label: "Flagged",   cls: "bg-red-500/10 border-red-500/20 text-red-400",             icon: <AlertTriangle className="w-3 h-3" /> },
  failed:    { label: "Failed",    cls: "bg-zinc-800 border-zinc-700 text-zinc-500",                icon: <XCircle className="w-3 h-3" /> },
};

const StatusBadge = ({ status }: { status: TxStatus }) => { const m = STATUS_META[status]??STATUS_META.failed; return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${m.cls}`}>{m.icon}{m.label}</span>; };
const coins = (tx: Transaction) => tx.amount ?? Math.round(tx.amountCents ?? 0);
const dateLabel = (ts: any): string => { if (!ts) return "Unknown"; const d = ts.toDate?ts.toDate():new Date(ts); const now=new Date(); const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()); const yest=new Date(today); yest.setDate(yest.getDate()-1); const txDay=new Date(d.getFullYear(),d.getMonth(),d.getDate()); if(txDay.getTime()===today.getTime()) return "Today"; if(txDay.getTime()===yest.getTime()) return "Yesterday"; return d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}); };
const timeLabel = (ts: any): string => { if (!ts) return "—"; const d = ts.toDate?ts.toDate():new Date(ts); return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); };
const groupByDate = (txs: Transaction[]) => { const g: Record<string,Transaction[]>={};for(const t of txs){const l=dateLabel(t.createdAt);if(!g[l])g[l]=[];g[l].push(t);}return Object.entries(g).map(([label,items])=>({label,items})); };
const FILTERS = [{label:"All Transactions",value:"all"},{label:"Offers",value:"offerwall_postback"},{label:"Tasks",value:"task_complete"},{label:"Referral Bonuses",value:"referral_commission"},{label:"Bonuses",value:"bonus"},{label:"Cashouts",value:"payout"}] as const;

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot|null>(null); const [hasMore, setHasMore] = useState(false);
  const [filterType, setFilterType] = useState<TxType|"all">("all"); const [filterOpen, setFilterOpen] = useState(false);

  const load = async (reset=false) => {
    if (!user) return; reset?setLoading(true):setLoadingMore(true);
    try {
      const base = [where("userId","==",user.uid),orderBy("createdAt","desc"),limit(PAGE+1)];
      const q = reset ? query(collection(db,"transactions"),...base) : query(collection(db,"transactions"),...base,startAfter(lastDoc));
      const snap = await getDocs(q); const more = snap.docs.length>PAGE; const page = more?snap.docs.slice(0,PAGE):snap.docs;
      const txs: Transaction[] = page.map((d)=>({id:d.id,...d.data()} as Transaction));
      setTransactions((p)=>reset?txs:[...p,...txs]); setLastDoc(page[page.length-1]??null); setHasMore(more);
    } catch(e){console.error(e);} finally{setLoading(false);setLoadingMore(false);}
  };

  useEffect(()=>{if(!authLoading&&user)load(true);if(!authLoading&&!user)setLoading(false);},[user,authLoading]);
  const displayed = filterType==="all"?transactions:transactions.filter((t)=>t.type===filterType);
  const groups = groupByDate(displayed);
  const totalEarned = transactions.filter((t)=>t.type!=="payout"&&t.status==="completed").reduce((s,t)=>s+coins(t),0);
  const totalOut = transactions.filter((t)=>t.type==="payout"&&t.status==="completed").reduce((s,t)=>s+coins(t),0);

  if(authLoading||(!user&&loading)) return <div className="min-h-screen bg-[#060606] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/></div>;
  if(!user) return <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4"><p className="text-zinc-400 font-semibold">Sign in to view transactions</p><Link href="/auth/signin" className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition">Sign In</Link></div>;

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col">
      <Header/>
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div><h1 className="text-3xl font-black tracking-tight">Transactions</h1><p className="text-zinc-500 text-sm mt-1">Every coin earned and cashed out</p></div>
        <div className="grid grid-cols-2 gap-4">
          {[{label:"Coins Earned",value:totalEarned,color:"text-emerald-400",iconBg:"bg-emerald-500/10 border-emerald-500/20",icon:<ArrowDownLeft className="w-5 h-5 text-emerald-400"/>},
            {label:"Cashed Out",value:totalOut,color:"text-red-400",iconBg:"bg-red-500/10 border-red-500/20",icon:<ArrowUpRight className="w-5 h-5 text-red-400"/>}].map(({label,value,color,iconBg,icon})=>(
            <div key={label} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${iconBg} border rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
              <div><p className={`text-xl font-black ${color}`}>{value.toLocaleString()}</p><p className="text-zinc-600 text-xs uppercase font-semibold tracking-wider">{label}</p></div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">{displayed.length} result{displayed.length!==1?"s":""}</p>
          <div className="relative">
            <button onClick={()=>setFilterOpen((o)=>!o)} className="flex items-center gap-2 px-4 py-2 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition">
              <Filter className="w-4 h-4"/>Filter<ChevronDown className={`w-4 h-4 transition-transform ${filterOpen?"rotate-180":""}`}/>
            </button>
            {filterOpen&&<div className="absolute right-0 top-full mt-2 z-20 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
              {FILTERS.map(({label,value})=>(<button key={value} onClick={()=>{setFilterType(value as any);setFilterOpen(false);}} className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition hover:bg-zinc-900 ${filterType===value?"text-emerald-400":"text-zinc-400"}`}>{label}</button>))}
            </div>}
          </div>
        </div>
        {loading?(
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl divide-y divide-zinc-900">
            {Array.from({length:8}).map((_,i)=><div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse"><div className="w-10 h-10 rounded-xl bg-zinc-900 shrink-0"/><div className="flex-grow space-y-2"><div className="h-4 w-36 bg-zinc-900 rounded"/><div className="h-3 w-24 bg-zinc-900 rounded"/></div><div className="h-5 w-20 bg-zinc-900 rounded"/></div>)}
          </div>
        ):displayed.length===0?(
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700"><Coins className="w-8 h-8"/></div>
            <div className="text-center"><p className="text-zinc-300 font-bold">No transactions yet</p><p className="text-zinc-600 text-sm mt-1">Complete an offer and it'll show up here</p></div>
            <Link href="/" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl transition">Browse Offers</Link>
          </div>
        ):(
          <div className="space-y-6">
            {groups.map(({label,items})=>(
              <div key={label}>
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-1 mb-2">{label}</p>
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-900/60">
                  {items.map((tx)=>{const meta=TYPE_META[tx.type]??TYPE_META.task_complete;const isDebit=tx.type==="payout";const amt=coins(tx);return(
                    <div key={tx.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.01] transition group">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${meta.iconBg}`}>{meta.icon}</div>
                      <div className="flex-grow min-w-0"><p className={`text-sm font-bold truncate ${meta.color}`}>{meta.label}</p><p className="text-xs text-zinc-700 mt-0.5 truncate">{tx.description??tx.offerId??timeLabel(tx.createdAt)}</p></div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-base font-black tracking-tight ${isDebit?"text-red-400":"text-emerald-400"}`}>{isDebit?"−":"+"}{amt.toLocaleString()}<span className="text-xs font-semibold opacity-50 ml-1">coins</span></span>
                        <StatusBadge status={tx.status}/>
                      </div>
                    </div>
                  );})}
                </div>
              </div>
            ))}
          </div>
        )}
        {hasMore&&!loading&&<div className="flex justify-center pt-2"><button onClick={()=>load(false)} disabled={loadingMore} className="px-6 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white text-sm font-semibold rounded-xl transition disabled:opacity-40">{loadingMore?"Loading…":"Load More"}</button></div>}
      </main>
    </div>
  );
}
