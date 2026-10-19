"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = { _id: string; fullName?: string; contactName?: string; companyName?: string; email?: string; lookingFor?: string; directoryContactEmail?: string };
type Directory = { items: Row[]; pagination: { page: number; pages: number; total: number } };

function Selector({ kind, selected, onChange }: { kind: "buyers" | "sellers"; selected: string[]; onChange: (value: string[]) => void }) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const directory = useQuery<Directory>({
    queryKey: ["lead-campaign", kind, search, page],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: "20", search });
      const response = await fetch(`/api/${kind}?${query}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || `Unable to load ${kind}`);
      return body.data;
    },
  });
  const rows = directory.data?.items || [];
  return <Card>
    <CardHeader><CardTitle>{kind === "buyers" ? "Select buyer leads" : "Select seller recipients"} ({selected.length})</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={`Search ${kind} by name, company or email`} />
      {directory.isError && <p className="text-sm text-destructive">{(directory.error as Error).message}</p>}
      <div className="max-h-80 space-y-1 overflow-y-auto">
        {directory.isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : rows.map((row) => {
          const checked = selected.includes(row._id);
          return <label key={row._id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50">
            <Checkbox checked={checked} onCheckedChange={() => onChange(checked ? selected.filter((id) => id !== row._id) : [...selected, row._id])} />
            <span className="min-w-0 text-sm"><span className="block font-medium">{row.companyName || row.fullName || row.contactName || "Unnamed"}</span><span className="block truncate text-muted-foreground">{kind === "buyers" ? row.lookingFor || row.fullName : row.directoryContactEmail || row.email}</span></span>
          </label>;
        })}
        {!directory.isLoading && !rows.length && <p className="py-8 text-center text-sm text-muted-foreground">No records found</p>}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Page {page} of {directory.data?.pagination?.pages || 1}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= (directory.data?.pagination?.pages || 1)} onClick={() => setPage(page + 1)}>Next</Button></div></div>
    </CardContent>
  </Card>;
}

export default function LeadCampaignsPage() {
  const [templateAction, setTemplateAction] = React.useState("");
  const [buyerIds, setBuyerIds] = React.useState<string[]>([]);
  const [sellerIds, setSellerIds] = React.useState<string[]>([]);
  const [sending, setSending] = React.useState(false);
  const templates = useQuery<{ actionName: string; name: string; enabled: boolean; type?: string; promoAudience?: string; buyerIds?: string[]; buyerLeads?: Row[] }[]>({
    queryKey: ["lead-campaign-templates"],
    queryFn: async () => {
      const response = await fetch("/api/mailers/templates?limit=100");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load templates");
      return body.data?.items || [];
    },
  });
  const selectedTemplate = templates.data?.find((item) => item.actionName === templateAction);
  const effectiveBuyerIds = selectedTemplate?.type === "promo_temp" ? selectedTemplate.buyerIds || [] : buyerIds;
  const send = async () => {
    if (!templateAction || !effectiveBuyerIds.length || !sellerIds.length) return toast.error("Choose a template, buyer leads and seller recipients");
    if (effectiveBuyerIds.length > 100 || sellerIds.length > 100) return toast.error("Select no more than 100 buyers and 100 sellers");
    setSending(true);
    try {
      const response = await fetch("/api/lead-campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateAction, buyerIds: effectiveBuyerIds, sellerIds }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Could not queue campaign");
      const { queued, total } = body.data;
      if (queued === total) {
        toast.success(`Lead email queued for ${queued} seller${queued === 1 ? "" : "s"}`);
        setBuyerIds([]); setSellerIds([]);
      } else {
        setSellerIds(body.data.results.filter((item: { queued: boolean; sellerId: string }) => !item.queued).map((item: { sellerId: string }) => item.sellerId));
        toast.error(`${queued} of ${total} emails queued. Only failed sellers remain selected for retry.`);
      }
    } catch (error) { toast.error((error as Error).message); }
    finally { setSending(false); }
  };
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold">Buyer leads to sellers</h1><p className="mt-1 text-sm text-muted-foreground">Choose an email template, the buyer leads to feature, and the sellers who should receive them. Each seller gets a personal link to their dashboard.</p></div>
    <Card><CardHeader><CardTitle>Campaign email</CardTitle></CardHeader><CardContent className="space-y-2"><Label htmlFor="campaign-template">Email template</Label><select id="campaign-template" value={templateAction} onChange={(event) => setTemplateAction(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select a template</option>{templates.data?.filter((item) => item.enabled && (item.type !== "promo_temp" || item.promoAudience !== "buyers")).map((item) => <option key={item.actionName} value={item.actionName}>{item.name}</option>)}</select><p className="text-xs text-muted-foreground">{selectedTemplate?.type === "promo_temp" ? `${effectiveBuyerIds.length} buyer leads are saved in this promo template.` : "Selected leads and dashboard links are added to the email. Add {{leads_html}} to control their position."}</p></CardContent></Card>
    <div className="grid gap-5 lg:grid-cols-2">{selectedTemplate?.type === "promo_temp" ? <Card><CardHeader><CardTitle>Buyer leads in template ({effectiveBuyerIds.length})</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{selectedTemplate.buyerLeads?.map((lead) => <div key={lead._id} className="rounded-lg border p-3"><p className="font-medium">{lead.companyName || lead.fullName || "Buyer"}</p><p className="text-muted-foreground">{lead.lookingFor || "Buyer requirement"}</p></div>)}</CardContent></Card> : <Selector kind="buyers" selected={buyerIds} onChange={setBuyerIds} />}<Selector kind="sellers" selected={sellerIds} onChange={setSellerIds} /></div>
    <Button onClick={send} disabled={sending || !templateAction || !effectiveBuyerIds.length || !sellerIds.length} className="bg-blue-600 text-white hover:bg-blue-500">{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}{sending ? "Queueing emails..." : `Send ${effectiveBuyerIds.length} leads to ${sellerIds.length} sellers`}</Button>
  </div>;
}
