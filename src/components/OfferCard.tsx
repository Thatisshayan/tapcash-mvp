import Image from "next/image";
import { Offer } from "@/types/offer";
import { Sparkles, ArrowUpRight, Gamepad2, FileText, Play, Smartphone, Star, Coins } from "lucide-react";

interface OfferCardProps { offer: Offer; onEarn: () => void; }

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; glow: string; badge: string }> = {
  Games:   { icon: <Gamepad2   className="w-4 h-4" />, glow: "group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)]",  badge: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
  Surveys: { icon: <FileText   className="w-4 h-4" />, glow: "group-hover:shadow-[0_8px_30px_rgba(14,165,233,0.1)]",  badge: "bg-sky-500/10 border-sky-500/20 text-sky-400" },
  Videos:  { icon: <Play       className="w-4 h-4" />, glow: "group-hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]",  badge: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  Apps:    { icon: <Smartphone className="w-4 h-4" />, glow: "group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]",  badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
};
const DEFAULT = { icon: <Star className="w-4 h-4" />, glow: "group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" };
const cfg = (cat?: string) => (cat && CATEGORY_CONFIG[cat]) ? CATEGORY_CONFIG[cat] : DEFAULT;

export default function OfferCard({ offer, onEarn }: OfferCardProps) {
  const { icon, glow, badge } = cfg(offer.category);
  return (
    <div className={`group relative bg-zinc-950 border border-zinc-800/80 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:-translate-y-1 ${glow}`}>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-5 flex flex-col gap-3 flex-grow">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {offer.image
                ? <Image src={offer.image} alt={offer.title} width={36} height={36} className="object-contain w-full h-full" unoptimized={offer.image.startsWith("http")} />
                : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">{icon}</div>}
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badge}`}>
              {icon}{offer.category ?? offer.provider}
            </span>
          </div>
          {offer.payout >= 500 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">
              <Sparkles className="w-3 h-3" />Hot
            </span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white leading-snug line-clamp-2 group-hover:text-zinc-100 transition-colors">{offer.title}</h3>
          <p className="text-zinc-500 text-xs leading-relaxed mt-1 line-clamp-2">{offer.description}</p>
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-zinc-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xl font-black text-emerald-400 tracking-tight">+{offer.payout.toLocaleString()}</span>
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-wide">coins</span>
        </div>
        <button onClick={onEarn}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.05] hover:bg-emerald-500 border border-white/10 hover:border-emerald-500 text-white hover:text-black text-xs font-extrabold rounded-xl transition-all duration-200 group/btn">
          Earn<ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
