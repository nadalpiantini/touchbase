"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";

// Mock data for billing UI (no Stripe integration)
const MOCK_SUBSCRIPTION = {
  plan: "Professional",
  status: "active",
  price: 99,
  currency: "USD",
  interval: "month",
  currentPeriodStart: "2024-11-01",
  currentPeriodEnd: "2024-12-01",
  seats: 100,
  usedSeats: 85,
};

const MOCK_INVOICES = [
  {
    id: "inv_001",
    date: "2024-11-01",
    amount: 99,
    status: "paid",
    description: "Professional Plan - November 2024",
  },
  {
    id: "inv_002",
    date: "2024-10-01",
    amount: 99,
    status: "paid",
    description: "Professional Plan - October 2024",
  },
  {
    id: "inv_003",
    date: "2024-09-01",
    amount: 99,
    status: "paid",
    description: "Professional Plan - September 2024",
  },
];

const MOCK_USAGE = {
  users: { current: 85, limit: 100 },
  storage: { current: 2.5, limit: 10, unit: "GB" },
  modules: { current: 50, limit: -1 }, // -1 = unlimited
  classes: { current: 25, limit: -1 },
};

export default function BillingPage() {
  const t = useTranslations("admin.billing");
  const locale = useLocale();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "info"> = {
      active: "success",
      paid: "success",
      pending: "warning",
      overdue: "warning",
    };
    return (
      <Badge variant={variants[status] || "info"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-tb-bone">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/${locale}/admin`} className="text-tb-shadow hover:text-tb-navy">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-display font-bold text-tb-navy">
              {t("title") || "Billing & Subscription"}
            </h1>
          </div>
          <p className="text-tb-shadow">
            {t("subtitle") || "Manage your subscription and payment methods"}
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-amber-800 font-medium">
              Demo Mode: This is a UI mockup. Billing integration coming soon.
            </span>
          </div>
        </div>

        {/* Current Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Current Plan</CardTitle>
                {getStatusBadge(MOCK_SUBSCRIPTION.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-tb-navy">
                  {MOCK_SUBSCRIPTION.plan}
                </span>
                <span className="text-xl text-tb-shadow">
                  ${MOCK_SUBSCRIPTION.price}/{MOCK_SUBSCRIPTION.interval}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-tb-shadow">Billing Period</p>
                  <p className="font-medium">
                    {new Date(
                      MOCK_SUBSCRIPTION.currentPeriodStart
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      MOCK_SUBSCRIPTION.currentPeriodEnd
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-tb-shadow">Seats</p>
                  <p className="font-medium">
                    {MOCK_SUBSCRIPTION.usedSeats} / {MOCK_SUBSCRIPTION.seats}{" "}
                    used
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Upgrade Plan
                </Button>
                <Button variant="outline">Manage Payment Methods</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Update Card
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-tb-shadow">Users</span>
                  <span className="text-sm font-medium">
                    {MOCK_USAGE.users.current} / {MOCK_USAGE.users.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-tb-rust rounded-full h-2"
                    style={{
                      width: `${
                        (MOCK_USAGE.users.current / MOCK_USAGE.users.limit) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-tb-shadow">Storage</span>
                  <span className="text-sm font-medium">
                    {MOCK_USAGE.storage.current} / {MOCK_USAGE.storage.limit}{" "}
                    {MOCK_USAGE.storage.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2"
                    style={{
                      width: `${
                        (MOCK_USAGE.storage.current /
                          MOCK_USAGE.storage.limit) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-tb-shadow">Modules</span>
                  <span className="text-sm font-medium">
                    {MOCK_USAGE.modules.current} / Unlimited
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 rounded-full h-2"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-tb-shadow">Classes</span>
                  <span className="text-sm font-medium">
                    {MOCK_USAGE.classes.current} / Unlimited
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 rounded-full h-2"
                    style={{ width: "20%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-tb-bone/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-tb-shadow uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tb-line">
                  {MOCK_INVOICES.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-tb-bone/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-tb-navy">
                            {invoice.id}
                          </div>
                          <div className="text-sm text-tb-shadow">
                            {invoice.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-tb-shadow">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${invoice.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border border-tb-line rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Starter</h3>
                    <p className="text-2xl font-bold mb-4">$29/mo</p>
                    <ul className="text-sm text-tb-shadow space-y-2">
                      <li>Up to 25 users</li>
                      <li>5 GB storage</li>
                      <li>Basic support</li>
                    </ul>
                  </div>
                  <div className="p-4 border-2 border-tb-rust rounded-lg bg-tb-rust/5">
                    <Badge variant="warning" className="mb-2">
                      Current
                    </Badge>
                    <h3 className="font-bold text-lg mb-2">Professional</h3>
                    <p className="text-2xl font-bold mb-4">$99/mo</p>
                    <ul className="text-sm text-tb-shadow space-y-2">
                      <li>Up to 100 users</li>
                      <li>10 GB storage</li>
                      <li>Priority support</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-tb-line rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Enterprise</h3>
                    <p className="text-2xl font-bold mb-4">$299/mo</p>
                    <ul className="text-sm text-tb-shadow space-y-2">
                      <li>Unlimited users</li>
                      <li>100 GB storage</li>
                      <li>24/7 support</li>
                    </ul>
                    <Button variant="primary" className="w-full mt-4">
                      Upgrade
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
