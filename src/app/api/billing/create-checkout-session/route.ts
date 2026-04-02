import type Stripe from "stripe";
import { auth } from "@/auth";
import {
  getStripe,
  getStripePriceIdMonthly,
  getStripePriceIdYearly,
} from "@/lib/billing/stripe";
import { shouldUseStripeTrialSync, trialEndUnixSeconds } from "@/lib/billing/trial";
import { getCompanyBilling } from "@/lib/companies/billing";
import { getAppBaseUrl } from "@/lib/env/app-url";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.companyId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let interval: "month" | "year" = "month";
  try {
    const body = (await req.json()) as { interval?: string };
    if (body.interval === "year") interval = "year";
  } catch {
    /* body optional */
  }

  const billing = await getCompanyBilling(session.user.companyId);
  if (!billing) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }

  const status = billing.subscription_status?.toLowerCase() ?? "";
  if (
    billing.stripe_subscription_id &&
    (status === "active" || status === "trialing")
  ) {
    return Response.json({ error: "Already subscribed" }, { status: 400 });
  }

  let stripe: ReturnType<typeof getStripe>;
  let priceId: string;
  try {
    stripe = getStripe();
    const yearlyId = getStripePriceIdYearly();
    priceId =
      interval === "year" && yearlyId ? yearlyId : getStripePriceIdMonthly();
  } catch {
    return Response.json(
      { error: "Billing is not configured (check Stripe env vars)." },
      { status: 503 },
    );
  }

  const trialEndsAt = new Date(billing.trial_ends_at);
  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
    {
      metadata: { company_id: session.user.companyId },
    };
  if (shouldUseStripeTrialSync(trialEndsAt)) {
    subscriptionData.trial_end = trialEndUnixSeconds(trialEndsAt);
  }

  const base = getAppBaseUrl();

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/settings?tab=billing&checkout=success`,
    cancel_url: `${base}/settings?tab=billing&checkout=cancel`,
    client_reference_id: session.user.companyId,
    metadata: { company_id: session.user.companyId },
    subscription_data: subscriptionData,
  };

  if (billing.stripe_customer_id) {
    params.customer = billing.stripe_customer_id;
  } else if (session.user.email) {
    params.customer_email = session.user.email;
  }

  const checkoutSession = await stripe.checkout.sessions.create(params);
  if (!checkoutSession.url) {
    return Response.json({ error: "No checkout URL returned" }, { status: 500 });
  }

  return Response.json({ url: checkoutSession.url });
}
