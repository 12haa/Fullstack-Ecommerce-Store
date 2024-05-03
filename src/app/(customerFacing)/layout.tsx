import React from "react";
import Nav, { NavLink } from "@/components/Nav";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">Sales</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  );
}
