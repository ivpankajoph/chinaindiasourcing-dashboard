"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LeadInvitePage() {
  const { token } = useParams<{ token: string }>();
  const started = React.useRef(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [needsPassword, setNeedsPassword] = React.useState(false);
  const [sellerName, setSellerName] = React.useState("Seller");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const destination = () => {
    const lead = new URLSearchParams(window.location.search).get("lead") || "";
    return `/explore-buyers${/^market-[a-f0-9]{24}$/.test(lead) ? `?lead=${lead}` : ""}`;
  };
  React.useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    void (async () => {
      const detailsResponse = await fetch(`/api/lead-invitations/${token}`);
      const details = await detailsResponse.json();
      if (!detailsResponse.ok) throw new Error(details.error?.message || "Lead link is unavailable");
      setSellerName(details.data.sellerName);
      setEmail(details.data.email);
      const claimResponse = await fetch(`/api/lead-invitations/${token}/claim`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: new URLSearchParams(window.location.search).get("lead") }) });
      const claim = await claimResponse.json();
      if (!claimResponse.ok) throw new Error(claim.error?.message || "Could not open seller dashboard");
      if (claim.data.needsPassword) setNeedsPassword(true);
      else window.location.replace(destination());
    })().catch((cause) => setError((cause as Error).message)).finally(() => setLoading(false));
  }, [token]);
  const activate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");
    setSaving(true);
    try {
      const response = await fetch(`/api/lead-invitations/${token}/password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not set password");
      toast.success("Seller account activated");
      window.location.replace(destination());
    } catch (cause) { toast.error((cause as Error).message); }
    finally { setSaving(false); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm"><div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><LockKeyhole className="size-7" /></div><h1 className="text-2xl font-bold">Your buyer leads</h1><p className="mt-2 text-sm text-muted-foreground">{loading ? "Opening your seller dashboard..." : error || `Welcome, ${sellerName}. Set your password to view the leads selected for you.`}</p>{loading && <Loader2 className="mx-auto mt-6 size-6 animate-spin text-blue-600" />}</div>
    <Dialog open={needsPassword} onOpenChange={() => {}}><DialogContent><DialogHeader><DialogTitle>Set your seller password</DialogTitle><DialogDescription>Your account for {email} is ready. Set a password to activate it and view your buyer leads.</DialogDescription></DialogHeader><form onSubmit={activate} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="invite-password">Password</Label><Input id="invite-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /></div><div className="space-y-1.5"><Label htmlFor="invite-confirm">Confirm password</Label><Input id="invite-confirm" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></div><Button type="submit" disabled={saving} className="w-full">{saving ? "Activating..." : "Activate and view leads"}</Button></form></DialogContent></Dialog>
  </main>;
}
