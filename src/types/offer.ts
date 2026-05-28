export interface Offer {
  id: string;
  title: string;
  description: string;
  payout: number;
  clickUrl: string;
  provider: string;
  image?: string;
  category?: string;
}
