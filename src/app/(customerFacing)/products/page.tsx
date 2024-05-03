import React, { Suspense } from "react";
import ProductsCard, { ProductCardSkeleton } from "@/components/ProductsCard";
import db from "@/db/db";

function getProducts() {
  return db.product.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: { name: "asc" },
  });
}
const ProductsPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }
      >
        <ProductsSuspense />
      </Suspense>
    </div>
  );
};

export default ProductsPage;

async function ProductsSuspense() {
  const products = await getProducts();
  return products.map((product) => {
    return <ProductsCard key={product.id} {...product}></ProductsCard>;
  });
}
