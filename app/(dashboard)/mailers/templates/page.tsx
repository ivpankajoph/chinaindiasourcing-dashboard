"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, Loader2, Pencil, Save, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type MailTemplate = { _id: string; actionName: string; name: string; description: string; subject: string; html: string; text: string; enabled: boolean; variables: string[]; updatedAt?: string };
type Mode = "preview" | "edit";
const samples: Record<string, string> = { name: "Aisha Al Mansoori", email: "aisha@example.com", company: "Aisha Trading LLC", form_type: "Buyer", password: "Secure@123", login_url: "https://admin.sellerslogin.com/sign-in", account_type: "Buyer" };
const renderSample = (value: string) => value.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => samples[key] || `{{${key}}}`);

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search.trim());
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<MailTemplate | null>(null);
  const [draft, setDraft] = React.useState<MailTemplate | null>(null);
  const [mode, setMode] = React.useState<Mode>("preview");
  React.useEffect(() => setPage(1), [deferredSearch, status]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["mailer-templates", page, deferredSearch, status],
    queryFn: async () => { const params = new URLSearchParams({ page: String(page), limit: "20" }); if (deferredSearch) params.set("search", deferredSearch); if (status !== "all") params.set("status", status); const response = await fetch(`/api/mailers/templates?${params}`); if (!response.ok) throw new Error("Unable to load templates"); return (await response.json()).data; },
    placeholderData: keepPreviousData,
  });
  const templates: MailTemplate[] = data?.items || [];
  const buyerActionTemplate = templates.find((template) => template.actionName === "buyer_create_form");
  const sellerActionTemplate = templates.find((template) => template.actionName === "seller_create_form");
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const openTemplate = (template: MailTemplate, nextMode: Mode) => { setSelected(template); setDraft({ ...template }); setMode(nextMode); };
  const save = useMutation({
    mutationFn: async () => { if (!draft) throw new Error("No template selected"); const response = await fetch(`/api/mailers/templates/${encodeURIComponent(draft.actionName)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: draft.subject, html: draft.html, text: draft.text, enabled: draft.enabled }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Unable to save template"); return body.data as MailTemplate; },
    onSuccess: async (updated) => { toast.success("Email template saved"); setSelected(updated); setDraft({ ...updated }); await queryClient.invalidateQueries({ queryKey: ["mailer-templates"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  return <div className="space-y-4"><div className="flex items-center justify-between"><h1 className="text-xl font-bold tracking-tight">Email Templates</h1><Badge variant="outline">{pagination.total} templates</Badge></div><Card className="overflow-hidden py-0"><CardContent className="p-0"><div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:items-center"><div className="relative flex-1 sm:max-w-md"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, action or subject..." className="h-10 pl-9"/></div><Select value={status} onValueChange={(value) => setStatus(value || "all")}><SelectTrigger className="h-10 w-full sm:w-44"><SelectValue placeholder="Status"/></SelectTrigger><SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="enabled">Enabled</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select></div>{isLoading ? <div className="p-4"><Skeleton className="h-72 w-full"/></div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead>Template</TableHead><TableHead>Action name</TableHead><TableHead>Subject</TableHead><TableHead>Variables</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{templates.map((template) => <TableRow key={template._id}><TableCell className="min-w-56"><div className="flex items-center gap-2.5"><div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950"><FileText className="size-4"/></div><span className="font-semibold">{template.name}</span></div></TableCell><TableCell><Badge variant="outline" className="font-mono">{template.actionName}</Badge></TableCell><TableCell className="max-w-80 truncate">{template.subject}</TableCell><TableCell><div className="flex min-w-48 flex-wrap gap-1">{template.variables.slice(0, 3).map((variable) => <Badge key={variable} variant="secondary">{`{{${variable}}}`}</Badge>)}{template.variables.length > 3 && <Badge variant="secondary">+{template.variables.length - 3}</Badge>}</div></TableCell><TableCell><Badge className={template.enabled ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}>{template.enabled ? "Enabled" : "Disabled"}</Badge></TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{template.updatedAt ? new Date(template.updatedAt).toLocaleDateString("en-IN") : "—"}</TableCell><TableCell><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openTemplate(template, "preview")}><Eye className="size-4"/> Preview</Button><Button size="sm" onClick={() => openTemplate(template, "edit")} className="bg-blue-600 text-white hover:bg-blue-500"><Pencil className="size-4"/> Edit</Button></div></TableCell></TableRow>)}{!templates.length && <TableRow><TableCell colSpan={7} className="h-40 text-center text-muted-foreground">No email templates found.</TableCell></TableRow>}</TableBody></Table></div>}<div className="flex items-center justify-between border-t px-4 py-3"><span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span><div className="flex gap-2"><Button variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button disabled={page >= pagination.pages || isFetching} onClick={() => setPage((value) => value + 1)} className="bg-blue-600 text-white hover:bg-blue-500">Next</Button></div></div></CardContent></Card>

    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) { setSelected(null); setDraft(null); } }}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl"><DialogHeader><div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between"><div><DialogTitle>{selected?.name}</DialogTitle><DialogDescription className="sr-only">Preview or edit this email template.</DialogDescription><Badge variant="outline" className="mt-2 font-mono">{selected?.actionName}</Badge></div><div className="flex items-center gap-2"><Button variant={mode === "preview" ? "default" : "outline"} onClick={() => setMode("preview")}><Eye className="size-4"/> Preview</Button><Button variant={mode === "edit" ? "default" : "outline"} onClick={() => setMode("edit")}><Pencil className="size-4"/> Edit</Button>{mode === "edit" && <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-blue-600 text-white hover:bg-blue-500">{save.isPending ? <Loader2 className="size-4 animate-spin"/> : <Save className="size-4"/>} Save</Button>}</div></div></DialogHeader>{draft && mode === "preview" ? <div className="space-y-3"><div className="rounded-lg border bg-muted/30 p-3"><span className="text-sm text-muted-foreground">Subject</span><p className="font-semibold">{renderSample(draft.subject)}</p></div><div className="overflow-hidden rounded-xl border bg-white"><iframe title="Email template preview" sandbox="" srcDoc={renderSample(draft.html)} className="h-[620px] w-full bg-white"/></div></div> : draft ? <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div className="flex flex-wrap gap-1.5">{draft.variables.map((variable) => <Badge key={variable} variant="secondary">{`{{${variable}}}`}</Badge>)}</div><div className="flex items-center gap-2"><Switch checked={draft.enabled} onCheckedChange={(enabled) => setDraft({ ...draft, enabled })}/><Label>Enabled</Label></div></div><div className="space-y-1.5"><Label>Subject</Label><Input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}/></div><Tabs defaultValue="html"><TabsList><TabsTrigger value="html">HTML</TabsTrigger><TabsTrigger value="text">Plain text</TabsTrigger></TabsList><TabsContent value="html" className="mt-3"><Textarea value={draft.html} onChange={(event) => setDraft({ ...draft, html: event.target.value })} className="min-h-[480px] font-mono text-xs"/></TabsContent><TabsContent value="text" className="mt-3"><Textarea value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} className="min-h-80 font-mono text-xs"/></TabsContent></Tabs></div> : null}</DialogContent></Dialog>
  </div>;
}
