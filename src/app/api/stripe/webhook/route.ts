import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendPurchaseReceipt } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe] webhook signature failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await onSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (e) {
    console.error("[stripe] webhook handler error", event.type, e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function onCheckoutCompleted(s: Stripe.Checkout.Session) {
  const userId = s.metadata?.userId;
  const kind = s.metadata?.kind;
  if (!userId) return;

  if (kind === "workshop" && s.metadata?.classEventId) {
    const eventId = s.metadata.classEventId;
    const event = await prisma.classEvent.findUnique({ where: { id: eventId } });
    if (!event) return;

    // Idempotent: skip if Purchase already exists
    const existing = await prisma.purchase.findUnique({
      where: { stripeSessionId: s.id },
    });
    if (!existing) {
      await prisma.purchase.create({
        data: {
          userId,
          stripeSessionId: s.id,
          amount: s.amount_total ?? event.priceCents ?? 0,
          currency: s.currency ?? "usd",
          itemType: "workshop",
          itemId: eventId,
        },
      });
    }
    // Auto-RSVP (only if user not already RSVPd)
    const existingRsvp = await prisma.rSVP.findFirst({
      where: { userId, classEventId: eventId, occurrence: null },
    });
    if (!existingRsvp) {
      await prisma.rSVP.create({
        data: { userId, classEventId: eventId, occurrence: null },
      });
    }
    // Receipt
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      sendPurchaseReceipt({
        to: user.email,
        itemTitle: event.title,
        amount: s.amount_total ?? event.priceCents ?? 0,
      }).catch((e) => console.error("[stripe] receipt email failed", e));
    }
  }

  // For subscriptions: handled separately by customer.subscription.* events
}

async function onSubscriptionUpdated(sub: Stripe.Subscription) {
  const userId = (sub.metadata?.userId as string | undefined) ?? null;
  let userIdResolved = userId;
  if (!userIdResolved) {
    // Look up by customer
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: sub.customer as string },
    });
    userIdResolved = user?.id ?? null;
  }
  if (!userIdResolved) return;

  const priceId = sub.items.data[0]?.price.id ?? "";
  const status = sub.status;
  const currentPeriodEnd = new Date(sub.current_period_end * 1000);

  await prisma.membership.upsert({
    where: { userId: userIdResolved },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    create: {
      userId: userIdResolved,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function onSubscriptionDeleted(sub: Stripe.Subscription) {
  await prisma.membership.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: { status: "canceled" },
  });
}

async function onInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  await prisma.membership.updateMany({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: "past_due" },
  });
}
