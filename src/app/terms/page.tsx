import Link from "next/link";
import { Coins } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#060606] text-white">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 border-b border-zinc-900 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-400">TapCash</span>
          </Link>
          <Link href="/" className="text-zinc-500 hover:text-white text-sm font-semibold transition">← Back</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        <div>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
          <p className="text-zinc-500 text-sm mt-2">Last updated: May 28, 2026</p>
        </div>

        {[
          { title: "1. Acceptance of Terms", body: `By accessing or using TapCash ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. TapCash is operated by TapCash Inc. and provides a platform for users to earn virtual coins by completing third-party tasks and offers, which may be redeemed for monetary rewards.` },
          { title: "2. Eligibility", body: `You must be at least 18 years old and a legal resident of a supported country to use TapCash. By registering, you represent and warrant that you meet these requirements. TapCash reserves the right to verify your identity at any time and to suspend or terminate accounts that do not meet eligibility requirements.` },
          { title: "3. Account Registration", body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration and to update it as necessary. TapCash is not liable for any loss resulting from unauthorized use of your account. You may not create multiple accounts or use another person's account.` },
          { title: "4. Earning and Redeeming Coins", body: `Coins are a virtual currency with no cash value except as expressly redeemable through the Service. Coins are earned by completing valid third-party offers and tasks. TapCash reserves the right to void coins earned through fraudulent activity, duplicate completions, or violations of offer terms. Minimum redemption thresholds apply. TapCash does not guarantee offer availability or payout amounts.` },
          { title: "5. Prohibited Conduct", body: `You may not: (a) use bots, scripts, or automation; (b) create fake accounts or use VPNs to misrepresent your location; (c) manipulate or abuse the referral system; (d) engage in fraudulent offer completions; (e) reverse-engineer or scrape the Service; (f) violate any applicable law. Violations will result in immediate account termination and forfeiture of all coins.` },
          { title: "6. Referral Program", body: `TapCash offers a referral program under which you may earn a percentage of your referrals' coin earnings. This percentage is subject to change at TapCash's discretion with reasonable notice. Referral commissions are only valid for genuine, non-fraudulent signups. TapCash reserves the right to reverse referral commissions if fraud is detected.` },
          { title: "7. Payouts", body: `Payouts are processed at TapCash's discretion, subject to verification and fraud review. TapCash is not responsible for delays caused by payment processors. We reserve the right to withhold payouts pending investigation of suspected fraud. Payouts are subject to applicable taxes; you are solely responsible for reporting and paying taxes on your earnings.` },
          { title: "8. Termination", body: `TapCash may suspend or terminate your account at any time for any reason, including but not limited to violations of these Terms. Upon termination, your right to use the Service ceases immediately and any unredeemed coins will be forfeited.` },
          { title: "9. Disclaimer of Warranties", body: `The Service is provided "AS IS" without warranties of any kind. TapCash does not warrant that the Service will be uninterrupted, error-free, or free from viruses or other harmful components. Your use of the Service is at your own risk.` },
          { title: "10. Limitation of Liability", body: `To the maximum extent permitted by law, TapCash and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our aggregate liability shall not exceed the amount of coins redeemed by you in the 12 months preceding the claim.` },
          { title: "11. Governing Law", body: `These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles. Any disputes shall be resolved through binding arbitration in Delaware.` },
          { title: "12. Changes to Terms", body: `TapCash reserves the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the Service. Continued use after changes constitutes acceptance of the new Terms.` },
          { title: "13. Contact", body: `For questions about these Terms, contact us at legal@tapcash.io.` },
        ].map(({ title, body }) => (
          <section key={title} className="space-y-2">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">{body}</p>
          </section>
        ))}
      </main>

      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-700">
        © {new Date().getFullYear()} TapCash · <Link href="/privacy" className="hover:text-emerald-500 transition">Privacy Policy</Link>
      </footer>
    </div>
  );
}
