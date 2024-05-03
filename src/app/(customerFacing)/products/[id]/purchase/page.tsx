import React from "react";
import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { throws } from "node:assert";
import CheckoutForm from "@/app/(customerFacing)/products/[id]/purchase/_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PurchasePage = async ({ params: { id } }: { params: { id: string } }) => {
  const product = await db.product.findUnique({
    where: { id },
  });
  if (!product) return notFound();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "USD",
    metadata: { productId: product.id },
  });
  if (paymentIntent.client_secret == null)
    throw new Error("Stripe Failed to create intent");
  return (
    <CheckoutForm
      clientSecret={paymentIntent.client_secret}
      products={product}
    />
  );
};

export default PurchasePage;
