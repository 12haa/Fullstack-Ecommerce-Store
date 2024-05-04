import React from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import Stripe from "stripe";
import { notFound } from "next/navigation";
import db from "@/db/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const SuccessPage = async ({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent,
  );

  if (paymentIntent.metadata.id === null) return notFound();

  const products = await db.product.findUnique({
    where: {
      id: paymentIntent.metadata.productId,
    },
  });
  if (products === null) return notFound();

  const isSuccess = paymentIntent.status === "succeeded";
  return (
    <div className="max-w-5xl w-ful`l mx-auto space-y-8">
      <h1 className="text-4xl font-bold ">
        {isSuccess ? "Success!" : "Error!"}
      </h1>
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0  w-1/3 relative">
          <Image
            src={products.imagePath}
            fill
            alt={products.name}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-lg">
            {formatCurrency(products.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{products.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            About &nbsp; {products.description}{" "}
          </div>
          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  products.id,
                )}}}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${products.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

async function createDownloadVerification(productId: string) {
  return (
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })
  ).id;
}
