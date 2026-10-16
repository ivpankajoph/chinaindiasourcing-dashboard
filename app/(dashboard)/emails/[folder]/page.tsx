"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Inbox, RotateCcw, Search, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const folders = ["sent", "unsent", "inbox", "draft", "spam", "trash"] as const;
type Folder = typeof folders[number];
type EmailMessage = { _id: string; direction: string; folder: Folder; fromAddress: string; fromName: string; to: string[]; subject: string; text: string; html: string; status: string; error: string; createdAt: string };

export default function EmailsPage() {
  const params = useParams<{ folder: string }>();
  const folder: Folder = folders.includes(params.folder as Folder) ? params.folder as Folder : "inbox";
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EmailMessage | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["emails", folder, page, search], queryFn: async () => { const query = new URLSearchParams({ folder, page: String(page), limit: "20", search }); const response = await fetch(`/api/emails?${query}`); if (!response.ok) throw new Error("Unable to load emails"); return (await response.json()).data; }, placeholderData: keepPreviousData });
  const move = useMutation({ mutationFn: async ({ id, action }: { id: string; action: string }) => { const response = await fetch(`/api/emails/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Unable to move email"); }, onSuccess: async () => { toast.success("Email moved"); setSelected(null); await queryClient.invalidateQueries({ queryKey: ["emails"] }); }, onError: (error: Error) => toast.error(error.message) });
  const items: EmailMessage[] = data?.items || [];
  const title = folder === "unsent" ? "Unsent" : folder.charAt(0).toUpperCase() + folder.slice(1);
  const counterpart = (message: EmailMessage) => message.direction === "inbound" ? `${message.fromName ? `${message.fromName} · ` : ""}${message.fromAddress}` : message.to.join(", ");

  return <div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-xl font-bold tracking-tight">{title}</h1><Badge variant="outline">{data?.pagination?.total || 0} emails</Badge></div><Card className="overflow-hidden"><div className="border-b p-4"><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="pl-9" placeholder={`Search ${title.toLowerCase()} emails...`} /></div></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>{folder === "sent" || folder === "unsent" ? "To" : "From"}</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isLoading ? [1,2,3].map((item) => <TableRow key={item}><TableCell colSpan={5}><Skeleton className="h-10" /></TableCell></TableRow>) : items.length ? items.map((message) => <TableRow key={message._id}><TableCell className="max-w-64 truncate font-medium">{counterpart(message)}</TableCell><TableCell className="max-w-96 truncate">{message.subject}</TableCell><TableCell><Badge variant={message.folder === "unsent" ? "destructive" : "outline"}>{message.status || message.folder}</Badge>{message.error && <p className="mt-1 max-w-48 truncate text-xs text-red-600">{message.error}</p>}</TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => setSelected(message)}><Eye className="size-4" /> View</Button>{folder === "trash" ? <Button size="sm" variant="ghost" onClick={() => move.mutate({ id: message._id, action: "restore" })}><RotateCcw className="size-4" /> Restore</Button> : <Button size="sm" variant="ghost" className="text-red-600" onClick={() => move.mutate({ id: message._id, action: "trash" })}><Trash2 className="size-4" /></Button>}{message.direction === "inbound" && folder !== "spam" && folder !== "trash" && <Button size="sm" variant="ghost" onClick={() => move.mutate({ id: message._id, action: "spam" })}><ShieldAlert className="size-4" /></Button>}{folder === "spam" && <Button size="sm" variant="ghost" onClick={() => move.mutate({ id: message._id, action: "inbox" })}><Inbox className="size-4" /></Button>}</div></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground">No emails in {title}.</TableCell></TableRow>}</TableBody></Table></div><div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground"><span>Page {data?.pagination?.page || 1} of {data?.pagination?.pages || 1}</span><div className="flex gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button className="bg-blue-600 text-white hover:bg-blue-500" disabled={page >= (data?.pagination?.pages || 1)} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></Card><Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{selected?.subject}</DialogTitle><DialogDescription>{selected && counterpart(selected)} · {selected && new Date(selected.createdAt).toLocaleString()}</DialogDescription></DialogHeader>{selected?.html ? <iframe title="Email content" sandbox="" className="min-h-96 w-full rounded-lg border bg-white" srcDoc={selected.html} /> : <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 font-sans">{selected?.text || "No content"}</pre>}</DialogContent></Dialog></div>;
}
