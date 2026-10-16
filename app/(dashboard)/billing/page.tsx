"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CreditCard, Download, Loader2, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingProfile = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  roleKey?: string;
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  paymentDetails?: {
    status?: string;
    feeUsd?: number;
    baseFeeUsd?: number;
    baseFeeAmount?: number;
    gstPercent?: number;
    gstUsd?: number;
    gstAmount?: number;
    exchangeRate?: number;
    amountDue?: number;
    currency?: string;
    couponCode?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string | null;
    invoiceId?: string;
    submissionId?: string;
  };
};

function money(amount: number | undefined, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: currency === "INR" ? 0 : 2 }).format(Number(amount || 0));
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return <div className="rounded-lg border bg-muted/20 p-4"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium">{value || "—"}</p></div>;
}

export default function BillingPage() {
  const { data: profile, isLoading, isError } = useQuery<BillingProfile>({
    queryKey: ["current-admin"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not load billing details");
      return body.data;
    },
  });
  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (isError || !profile || !["buyer", "seller"].includes(profile.roleKey || "")) return <div className="mx-auto max-w-3xl rounded-xl border p-8 text-center"><h1 className="text-xl font-semibold">Billing details unavailable</h1><p className="mt-2 text-sm text-muted-foreground">Sign in with a buyer or seller account linked to Sellerslogin Market to view its payment record.</p></div>;

  const payment = profile.paymentDetails || {};
  const paid = payment.status === "paid";
  const currency = String(payment.currency || "USD").toUpperCase();
  const base = currency === "INR" ? payment.baseFeeAmount : payment.baseFeeUsd;
  const tax = currency === "INR" ? payment.gstAmount : payment.gstUsd;
  const total = payment.amountDue || payment.feeUsd || 0;
  const fullAddress = [profile.address, profile.city, profile.state, profile.pincode, profile.country].filter(Boolean).join(", ");

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight">Payment &amp; Billing</h1><p className="mt-1 text-sm text-muted-foreground">Your Sellerslogin Market registration payment and invoice.</p></div>
    <section className="rounded-xl border bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><div className={`flex size-12 items-center justify-center rounded-xl ${paid ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40"}`}>{paid ? <BadgeCheck className="size-6" /> : <CreditCard className="size-6" />}</div><div><h2 className="font-semibold">Market registration payment</h2><p className="mt-1 text-sm text-muted-foreground">{profile.role === "Buyer" ? "Buyer" : "Seller"} account · {profile.companyName || profile.name || "Member"}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${paid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>{paid ? "Paid" : payment.status || "No payment recorded"}</span></div>
      {paid ? <>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Invoice number" value={payment.invoiceId} />
          <Detail label="Payment date" value={payment.paidAt ? new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(new Date(payment.paidAt)) : "—"} />
          <Detail label="Payment gateway" value="Razorpay" />
          <Detail label="Payment ID" value={payment.razorpayPaymentId} />
          <Detail label="Order ID" value={payment.razorpayOrderId} />
          <Detail label="Market submission ID" value={payment.submissionId} />
        </div>
        <div className="mt-7 rounded-xl border p-5">
          <div className="mb-4 flex items-center gap-2 font-semibold"><ReceiptText className="size-4 text-primary" />Invoice breakdown</div>
          <div className="space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Market registration / verification fee</span><span>{money(base ?? payment.feeUsd, currency)}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">GST / tax{payment.gstPercent ? ` (${payment.gstPercent}%)` : ""}</span><span>{money(tax, currency)}</span></div>{payment.couponCode && <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400"><span>Coupon applied</span><span>{payment.couponCode}</span></div>}<div className="flex justify-between gap-4 border-t pt-3 text-base font-bold"><span>Total paid</span><span>{money(total, currency)}</span></div>{payment.exchangeRate ? <p className="text-xs text-muted-foreground">Checkout exchange rate: {payment.exchangeRate}</p> : null}</div>
        </div>
        <div className="mt-7 border-t pt-6"><h3 className="mb-3 font-semibold">Billed to</h3><div className="grid gap-3 sm:grid-cols-2"><Detail label="Name" value={profile.name} /><Detail label="Company" value={profile.companyName} /><Detail label="Email" value={profile.email} /><Detail label="Address" value={fullAddress || "—"} /></div></div>
        <div className="mt-6 flex justify-end"><Button asChild><a href="/api/member/billing/invoice"><Download className="size-4" />Download invoice PDF</a></Button></div>
      </> : <div className="mt-7 rounded-lg border border-dashed bg-muted/20 p-6 text-center"><CreditCard className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-3 font-semibold">No completed payment found</h3><p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">This page displays the payment confirmed during your Sellerslogin Market registration. An invoice becomes available after that payment is marked paid.</p></div>}
    </section>
  </div>;
}
