import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripe = new Stripe(key, { typescript: true });
  }
  return stripe;
}

/** Monthly subscription Price id (e.g. price_...). */
export function getStripePriceIdMonthly(): string {
  const id = process.env.STRIPE_PRICE_MONTHLY?.trim();
  if (!id) throw new Error("STRIPE_PRICE_MONTHLY is not set");
  return id;
}

/** Yearly subscription Price id — optional; falls back to monthly-only UX if unset. */
export function getStripePriceIdYearly(): string | null {
  const id = process.env.STRIPE_PRICE_YEARLY?.trim();
  return id || null;
}
