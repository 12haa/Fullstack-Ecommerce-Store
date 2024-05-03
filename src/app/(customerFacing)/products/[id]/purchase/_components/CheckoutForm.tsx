"use client";
import React, { FormEvent, useState } from "react";
import { Product } from "@prisma/client";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { element } from "prop-types";
import { useOrderExists, userOrderExists } from "@/app/actions/orders";

type CheckoutFormProps = {
  clientSecret: string;
  products: {
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
    id: string;
  };
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string,
);

const CheckoutForm = ({ clientSecret, products }: CheckoutFormProps) => {
  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
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
        </div>
      </div>
      <Elements options={{ clientSecret }} stripe={stripePromise}>
        <Form priceInCents={products.priceInCents} productId={products?.id} />
      </Elements>
    </div>
  );
};

export default CheckoutForm;

function Form({
  priceInCents,
  productId,
}: {
  priceInCents: number;
  productId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (stripe == null || elements == null || email == null) return;
    setIsLoading(true);

    const orderExists = await userOrderExists(email, productId);
    if (orderExists) {
      setErrorMessage("You have already ordered this product");
      setIsLoading(false);
      return;
    }
    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${
            process.env.NEXT_PUBLIC_SERVER_URL as string
          }/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An Unknown Error occurred");
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          {errorMessage && (
            <CardDescription className="text-destructive">
              {errorMessage}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full "
            size="lg"
            disabled={stripe == null || element == null || isLoading}
          >
            {isLoading
              ? "Purchasing"
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
