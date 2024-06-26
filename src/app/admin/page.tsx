import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";

// Get Sales Data
async function getSalesData() {
  const data = await db?.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  return {
    amount: (data?._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data?._count,
  };
}

// Get user Data
async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);
  await wait(2000);
  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

// Get Product Data
async function getProductData() {
  const [activeCount, inactiveCounts] = await Promise.all([
    db.product.count({
      where: {
        isAvailableForPurchase: true,
      },
    }),
    db.product.count({
      where: {
        isAvailableForPurchase: false,
      },
    }),
  ]);
  return { activeCount, inactiveCounts };
}
function wait(duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

const AdminDashboardPage = async () => {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
        body={formatCurrency(salesData.amount)}
      />
      <DashboardCard
        title="Customers"
        subtitle={`${formatCurrency(
          userData.averageValuePerUser,
        )} Average Value`}
        body={formatNumber(userData.userCount)}
      />
      <DashboardCard
        title="Active Products"
        subtitle={`${formatNumber(productData.inactiveCounts)} Inactive`}
        body={formatNumber(productData.activeCount)}
      />
    </div>
  );
};

export default AdminDashboardPage;

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
