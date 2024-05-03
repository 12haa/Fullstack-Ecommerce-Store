import db from "@/db/db";
import { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductsCard, { ProductCardSkeleton } from "@/components/ProductsCard";
import { Suspense } from "react";
import { cache } from "@/lib/cache";

const getMostPopularProducts = cache(() => {
  return db.product.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: { order: { _count: "desc" } },
    take: 6,
  });
}, ["/purchase", "getProducts"]);
const getNewestProducts = cache(
  () => {
    return db.product.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  },
  ["/", "getNewestProducts"],
  { revalidate: 60 * 60 * 24 },
);
// Artificial Delay Function to test skeleton
function wait(durations: number) {
  return new Promise((resolve) => setTimeout(resolve, durations));
}

export default function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        title="Most Popular Products"
        productFetcher={getMostPopularProducts}
      />
      <ProductGridSection
        title="Newest Products"
        productFetcher={getNewestProducts}
      />
    </main>
  );
}
type ProductGridSectionProps = {
  productFetcher: () => Promise<Product[]>;
  title: string;
};
function ProductGridSection({
  productFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 ">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button asChild variant="outline">
          <Link href="/prodcuts" className="space-x-2">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      {/*  Gid For Products*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productFetcher={productFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  productFetcher,
}: {
  productFetcher: () => Promise<Product[]>;
}) {
  return (await productFetcher()).map((prodcut) => (
    <ProductsCard key={prodcut.id} {...prodcut} />
  ));
}
