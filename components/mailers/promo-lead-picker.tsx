"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type PromoLead = { _id: string; fullName?: string; contactName?: string; companyName?: string; email?: string; lookingFor?: string; titleOfServices?: string };

export function PromoLeadPicker({ kind, selected, onChange }: { kind: "buyers" | "sellers"; selected: PromoLead[]; onChange: (leads: PromoLead[]) => void }) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  React.useEffect(() => { setSearch(""); setPage(1); }, [kind]);
  const { data, isLoading, isError } = useQuery<{ items: PromoLead[]; pagination: { pages: number; total: number } }>({
    queryKey: ["promo-template-leads", kind, search, page],
    queryFn: async () => {
      const query = new URLSearchParams({ search, page: String(page), limit: "20" });
      const response = await fetch(`/api/${kind}?${query}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || `Unable to load ${kind}`);
      return body.data;
    },
  });
  const selectedIds = new Set(selected.map((lead) => lead._id));
  const toggle = (lead: PromoLead) => onChange(selectedIds.has(lead._id) ? selected.filter((item) => item._id !== lead._id) : [...selected, lead]);
  return <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
    <div><p className="font-medium">Add {kind === "buyers" ? "buyer" : "seller"} leads ({selected.length}/100)</p><p className="text-xs text-muted-foreground">Choose the leads that should appear in this promo template. You can select across pages.</p></div>
    <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={`Search ${kind === "buyers" ? "buyers" : "sellers"}, company or requirement`} />
    {isError && <p className="text-sm text-destructive">Could not load {kind} leads</p>}
    <div className="max-h-72 space-y-1 overflow-y-auto">
      {isLoading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading {kind}...</p> : data?.items?.length ? data.items.map((lead) => <label key={lead._id} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 hover:bg-muted/50"><Checkbox checked={selectedIds.has(lead._id)} disabled={!selectedIds.has(lead._id) && selected.length >= 100} onCheckedChange={() => toggle(lead)} /><span className="min-w-0 text-sm"><span className="block font-medium">{lead.companyName || lead.fullName || lead.contactName || "Lead"}</span><span className="block truncate text-muted-foreground">{lead.lookingFor || lead.titleOfServices || lead.email || "Lead"}</span></span></label>) : <p className="py-6 text-center text-sm text-muted-foreground">No {kind} found</p>}
    </div>
    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Page {page} of {data?.pagination?.pages || 1}</span><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button type="button" variant="outline" size="sm" disabled={page >= (data?.pagination?.pages || 1)} onClick={() => setPage(page + 1)}>Next</Button></div></div>
    {selected.length > 0 && <div className="flex flex-wrap gap-2 border-t pt-3">{selected.map((lead) => <button key={lead._id} type="button" onClick={() => toggle(lead)} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100" title="Remove lead">{lead.companyName || lead.fullName || lead.contactName || "Lead"} ×</button>)}</div>}
  </div>;
}
