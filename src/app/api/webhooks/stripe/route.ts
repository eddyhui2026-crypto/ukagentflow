import type Stripe from "stripe";
import { headers } from "next/headers";
import { getStripe } from "@/lib/billing/stripe";
import {
  updateCompanyStripeBilling,
  updateCompanySubscriptionStatusByStripeSub,
} from "@/lib/companies/billing";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!whSecret || !sig) {
    return new Response("Bad Request", { status: 400 });
  }

  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch {
    return new Response("Stripe not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const sessionObj = event.data.object as Stripe.Checkout.Session;
      if (sessionObj.mode !== "subscription") break;

      const companyId =
        sessionObj.client_reference_id ?? sessionObj.metadata?.company_id ?? null;
      const subId =
        typeof sessionObj.subscription === "string"
          ? sessionObj.subscription
          : sessionObj.subscription?.id;
      const customerId =
        typeof sessionObj.customer === "string"
          ? sessionObj.customer
          : sessionObj.customer?.id;

      if (!companyId || !subId || !customerId) break;

      const sub = await stripe.subscriptions.retrieve(subId);
      await updateCompanyStripeBilling({
        companyId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subId,
        subscriptionStatus: sub.status,
      });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const companyId = sub.metadata?.company_id ?? null;
      const customerRef = sub.customer;
      const customerId =
        typeof customerRef === "string"
          ? customerRef
          : customerRef && typeof customerRef === "object" && "id" in customerRef
            ? customerRef.id
            : null;
      if (companyId && customerId) {
        await updateCompanyStripeBilling({
          companyId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          subscriptionStatus: sub.status,
        });
      } else {
        await updateCompanySubscriptionStatusByStripeSub(sub.id, sub.status);
      }
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
