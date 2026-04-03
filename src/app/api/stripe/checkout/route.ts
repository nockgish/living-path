import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, getOrCreateStripeCustomer, MEMBERSHIP_PRICES } from "@/lib/stripe";

const Body = z.union([
  z.object({
    kind: z.literal("membership"),
    plan: z.enum(["monthly", "annual"]),
  }),
  z.object({
    kind: z.literal("workshop"),
    classEventId: z.string().min(1),
  }),
]);

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer(
    session.user.id,
    session.user.email,
    session.user.name
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (parsed.data.kind === "membership") {
    const priceId = MEMBERSHIP_PRICES[parsed.data.plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Membership plan not configured" },
        { status: 500 }
      );
    }
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/account/membership?success=1`,
      cancel_url: `${baseUrl}/account/membership?canceled=1`,
      metadata: { userId: session.user.id, kind: "membership" },
      subscription_data: { metadata: { userId: session.user.id } },
    });
    return NextResponse.json({ url: checkout.url });
  }

  // Workshop
  const event = await prisma.classEvent.findUnique({
    where: { id: parsed.data.classEventId },
  });
  if (!event || !event.isWorkshop || event.priceCents == null) {
    return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
  }
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: event.priceCents,
          product_data: {
            name: event.title,
            description: event.description.slice(0, 200),
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/account/purchases?success=1`,
    cancel_url: `${baseUrl}/classes?canceled=1`,
    metadata: {
      userId: session.user.id,
      kind: "workshop",
      classEventId: event.id,
    },
  });
  return NextResponse.json({ url: checkout.url });
}
