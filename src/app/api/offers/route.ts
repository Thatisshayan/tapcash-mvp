import { NextRequest, NextResponse } from "next/server";
import { Offer } from "@/types/offer";

interface LootablyOffer {
  type: string; name: string; description: string; image: string;
  countries: string[]; offerID: string; categories: string[]; devices: string[];
  link: string; conversionRate: number; currencyReward?: number | "variable"; revenue?: number | "variable";
}

const MOCK_OFFERS: Offer[] = [
  { id: "mock-survey-1", title: "Complete Consumer Habits Survey", description: "Share your daily shopping opinion and earn coins instantly.", payout: 150, clickUrl: "#", provider: "Survey Junkie", category: "Surveys", image: "https://logo.clearbit.com/surveyjunkie.com" },
  { id: "mock-game-1",   title: "Raid: Shadow Legends — Reach Level 40", description: "Build your army in an epic fantasy RPG.", payout: 800, clickUrl: "#", provider: "Plarium", category: "Games", image: "https://logo.clearbit.com/plarium.com" },
  { id: "mock-video-1",  title: "Watch 3 Video Advertisements", description: "Watch short video ads and earn rewards.", payout: 25, clickUrl: "#", provider: "AdGate", category: "Videos", image: "https://logo.clearbit.com/adgaterewards.com" },
  { id: "mock-app-1",    title: "Install Cash App & Make a Payment", description: "Send money instantly using the Cash App.", payout: 500, clickUrl: "#", provider: "Cash App", category: "Apps", image: "https://logo.clearbit.com/cash.app" },
  { id: "mock-survey-2", title: "Swagbucks Daily Poll", description: "Answer a quick daily question.", payout: 50, clickUrl: "#", provider: "Swagbucks", category: "Surveys", image: "https://logo.clearbit.com/swagbucks.com" },
  { id: "mock-app-2",    title: "Sign Up for Robinhood", description: "Create a free brokerage account and get a bonus stock.", payout: 1200, clickUrl: "#", provider: "Robinhood", category: "Apps", image: "https://logo.clearbit.com/robinhood.com" },
];

function transformOffer(o: LootablyOffer): Offer {
  const payout = typeof o.currencyReward === "number" ? o.currencyReward : 0;
  return {
    id: o.offerID, title: o.name, description: o.description, payout, clickUrl: o.link,
    provider: "lootably", image: o.image || undefined,
    category: o.categories?.[0] ? o.categories[0].charAt(0).toUpperCase() + o.categories[0].slice(1) : "Offer",
  };
}

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const apiKey = process.env.LOOTABLY_API_KEY;
  if (!apiKey) return NextResponse.json({ offers: MOCK_OFFERS, source: "mock" }, { headers: { "Cache-Control": "public, s-maxage=300" } });

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const res = await fetch("https://api.lootably.com/api/v2/offers/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placementID: process.env.LOOTABLY_PLACEMENT_ID, apiKey, userData: { userID: userId, userAgentHeader: request.headers.get("user-agent") || "", ipAddress: ip } }),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Lootably ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data?.offers)) {
      return NextResponse.json({ offers: json.data.offers.map(transformOffer), source: "lootably" }, { headers: { "Cache-Control": "public, s-maxage=300" } });
    }
    throw new Error("Bad response");
  } catch (err) {
    console.error("Offers API error:", err);
    return NextResponse.json({ offers: MOCK_OFFERS, source: "mock" }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  }
}
