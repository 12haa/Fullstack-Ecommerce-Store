import React from "react";
import PageHeader from "@/app/admin/_components/PageHeader";
import ProductForm from "@/app/admin/products/new/_components/ProductForm";

const NewProductPage = () => {
  return (
    <>
      <PageHeader>Product</PageHeader>
      <ProductForm />
    </>
  );
};

export default NewProductPage;
