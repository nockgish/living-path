import Stripe from "stripe";
import { prisma } from "@/lib/db";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" })
  : (null as unknown as Stripe);

export const MEMBERSHIP_PRICES = {
  monthly: process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY,
  annual: process.env.STRIPE_PRICE_MEMBERSHIP_ANNUAL,
} as const;

export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
