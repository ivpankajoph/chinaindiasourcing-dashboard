"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Mail, Pencil, Plus, Server, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type MailAccount = { address: string; name: string; sources: string[]; isDefault: boolean; isAlias?: boolean };
type AccountUpdate = { address: string; name?: string; setDefault?: boolean };

export default function EmailAccountsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MailAccount | null>(null);
  const [senderName, setSenderName] = useState("");
  const [addingAlias, setAddingAlias] = useState(false);
  const [aliasName, setAliasName] = useState("China India Sourcing");
  const [aliasAddress, setAliasAddress] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["mailer-accounts"],
    queryFn: async () => {
      const response = await fetch("/api/mailers/accounts");
      if (!response.ok) throw new Error("Unable to load email accounts");
      return (await response.json()).data;
    },
  });
  const updateAccount = useMutation({
    mutationFn: async (payload: AccountUpdate) => {
      const response = await fetch("/api/mailers/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to update sender");
      return body;
    },
    onSuccess: async (_body, variables) => {
      toast.success(variables.name === undefined ? "Default sender updated" : "Sender name updated for this dashboard");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["mailer-accounts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const accounts: MailAccount[] = data?.accounts || [];
  const editName = (account: MailAccount) => { setEditing(account); setSenderName(account.name); };
  const addAlias = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/mailers/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: aliasName.trim(), address: aliasAddress.trim() }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to add sender alias");
      return body;
    },
    onSuccess: async () => { toast.success("Sender alias added"); setAddingAlias(false); setAliasAddress(""); setAliasName("China India Sourcing"); await queryClient.invalidateQueries({ queryKey: ["mailer-accounts"] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const removeAlias = useMutation({
    mutationFn: async (address: string) => {
      const response = await fetch(`/api/mailers/accounts?address=${encodeURIComponent(address)}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to remove sender alias");
      return body;
    },
    onSuccess: async () => { toast.success("Sender alias removed"); await queryClient.invalidateQueries({ queryKey: ["mailer-accounts"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold tracking-tight">Email Accounts</h1><p className="text-xs text-muted-foreground">Backend-configured sender identities available to admin mail actions.</p></div><Button onClick={() => setAddingAlias(true)} className="bg-blue-600 text-white hover:bg-blue-500"><Plus className="size-4" /> Add alias</Button></div>
    <div className="grid gap-4 sm:grid-cols-3">
      <Card><CardContent className="flex items-center gap-3 p-5"><div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Mail className="size-5" /></div><div><p className="text-xs text-muted-foreground">Available senders</p><p className="text-xl font-bold">{accounts.length}</p></div></CardContent></Card>
      <Card><CardContent className="flex items-center gap-3 p-5"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><Server className="size-5" /></div><div><p className="text-xs text-muted-foreground">SMTP status</p><p className="text-sm font-semibold">{data?.smtpConfigured ? "Configured" : "Missing credentials"}</p></div></CardContent></Card>
      <Card><CardContent className="flex items-center gap-3 p-5"><div className="rounded-xl bg-violet-50 p-3 text-violet-600"><ShieldCheck className="size-5" /></div><div className="min-w-0"><p className="text-xs text-muted-foreground">Default sender</p><p className="truncate text-sm font-semibold">{data?.defaultAddress || "Not selected"}</p></div></CardContent></Card>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-base">Sender accounts</CardTitle><CardDescription>Choose a default address or edit the sender name used only by this admin dashboard.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? [1, 2].map((item) => <Skeleton key={item} className="h-24" />) : accounts.length ? accounts.map((account) => <div key={account.address} className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${account.isDefault ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}>
          <div className="flex min-w-0 items-center gap-3"><div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${account.isDefault ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}><Mail className="size-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{account.name}</p>{account.isDefault && <Badge className="bg-emerald-600 text-white">Default</Badge>}</div><p className="truncate text-sm text-muted-foreground">{account.address}</p><div className="mt-1 flex flex-wrap gap-1">{account.sources.map((source) => <Badge key={source} variant="outline">{source}</Badge>)}</div></div></div>
          <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => editName(account)}><Pencil className="size-4" /> Edit name</Button>{account.isAlias && !account.isDefault && <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={removeAlias.isPending} onClick={() => removeAlias.mutate(account.address)}><Trash2 className="size-4" /> Remove</Button>}{account.isDefault ? <div className="flex items-center gap-2 px-2 font-medium text-emerald-600"><CheckCircle2 className="size-5" /> Active sender</div> : <Button onClick={() => updateAccount.mutate({ address: account.address })} disabled={updateAccount.isPending} className="bg-blue-600 text-white hover:bg-blue-500">Set as default</Button>}</div>
        </div>) : <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No valid sender email was found in backend environment variables.</div>}
      </CardContent>
    </Card>
    <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit sender name</DialogTitle><DialogDescription>This display name is saved only for the China India Sourcing dashboard. The email address and other dashboards will not change.</DialogDescription></DialogHeader>
        <div className="space-y-2"><Label htmlFor="sender-name">Sender name</Label><Input id="sender-name" value={senderName} onChange={(event) => setSenderName(event.target.value)} maxLength={80} placeholder="China India Sourcing" /><p className="text-xs text-muted-foreground">Email: {editing?.address}</p></div>
        <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button className="bg-blue-600 text-white hover:bg-blue-500" disabled={updateAccount.isPending || senderName.trim().length < 2} onClick={() => editing && updateAccount.mutate({ address: editing.address, name: senderName.trim(), setDefault: false })}>{updateAccount.isPending ? "Saving..." : "Save name"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={addingAlias} onOpenChange={setAddingAlias}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add sender alias</DialogTitle><DialogDescription>Add another From address for this dashboard using the existing SMTP connection.</DialogDescription></DialogHeader>
        <div className="space-y-4"><div className="space-y-2"><Label htmlFor="alias-name">Sender name</Label><Input id="alias-name" value={aliasName} onChange={(event) => setAliasName(event.target.value)} maxLength={80} placeholder="China India Sourcing" /></div><div className="space-y-2"><Label htmlFor="alias-address">Alias email address</Label><Input id="alias-address" type="email" value={aliasAddress} onChange={(event) => setAliasAddress(event.target.value)} placeholder="team@chinaindiasourcing.com" /></div><div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><p>This address or its domain must be verified and permitted by your SMTP provider, otherwise messages may be rejected or land in spam.</p></div></div>
        <DialogFooter><Button variant="outline" onClick={() => setAddingAlias(false)}>Cancel</Button><Button className="bg-blue-600 text-white hover:bg-blue-500" disabled={addAlias.isPending || aliasName.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(aliasAddress.trim())} onClick={() => addAlias.mutate()}>{addAlias.isPending ? "Adding..." : "Add alias"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
