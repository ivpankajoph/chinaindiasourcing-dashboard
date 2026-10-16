"use client";

import * as React from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Columns3, Eye, EyeOff, FilterX, KeyRound, Loader2, Lock, Mail, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Kind = "buyers" | "sellers";
type ColumnKey = "date" | "person" | "company" | "offering" | "contact" | "location" | "status";
type Filters = { status: string; payment: string; stage: string; role: string };

const initialFilters: Filters = { status: "all", payment: "all", stage: "all", role: "all" };
const initialColumns: Record<ColumnKey, boolean> = { date: true, person: true, company: true, offering: true, contact: true, location: true, status: true };
const columnLabels: Record<ColumnKey, string> = { date: "Date", person: "Name", company: "Company", offering: "Requirement / Service", contact: "Contact", location: "Location", status: "Status" };

export function DirectoryTable({ type }: { type: Kind }) {
  const isBuyer = type === "buyers";
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search.trim());
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState<Filters>(initialFilters);
  const [columns, setColumns] = React.useState(initialColumns);
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [credentialId, setCredentialId] = React.useState<string | null>(null);
  const [credentialsOpen, setCredentialsOpen] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => setPage(1), [deferredSearch, filters]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["market-directory", type, deferredSearch, page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (deferredSearch) params.set("search", deferredSearch);
      Object.entries(filters).forEach(([key, value]) => value !== "all" && params.set(key, value));
      const response = await fetch(`/api/${type}?${params}`);
      if (!response.ok) throw new Error(`Failed to load Market ${type}`);
      return (await response.json()).data;
    },
    placeholderData: keepPreviousData,
  });
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["market-detail", type, detailId],
    queryFn: async () => {
      const response = await fetch(`/api/${type}/${detailId}`);
      if (!response.ok) throw new Error("Failed to load full record");
      return (await response.json()).data;
    },
    enabled: Boolean(detailId),
  });
  const credentialsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/${type}/${credentialId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to update credentials");
      return body;
    },
    onSuccess: async (result) => { result.data?.mail?.sent ? toast.success("Login credentials saved and emailed") : toast.warning("Credentials updated, but email could not be sent"); setCredentialsOpen(false); setLoginPassword(""); setShowLoginPassword(false); await queryClient.invalidateQueries({ queryKey: ["market-detail", type, credentialId] }); await queryClient.invalidateQueries({ queryKey: ["market-directory", type] }); setCredentialId(null); },
    onError: (error: Error) => toast.error(error.message),
  });

  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };
  const hasFilters = Boolean(deferredSearch) || Object.values(filters).some((value) => value !== "all");
  const updateFilter = (key: keyof Filters, value: string | null) => setFilters((current) => ({ ...current, [key]: value || "all" }));
  const resetFilters = () => { setSearch(""); setFilters(initialFilters); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold tracking-tight">Market {isBuyer ? "Buyers" : "Sellers"}</h1><p className="text-xs text-muted-foreground">{pagination.total} records from SellersLogin Market</p></div>
        <Button size="sm" onClick={() => refetch()} disabled={isFetching} className="bg-blue-600 text-white hover:bg-blue-500"><RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      <Card className="shadow-sm border-border/80 gap-0 py-0 overflow-hidden">
       
        <CardContent className="p-0">
          <div className="flex flex-col gap-2 border-b p-3 xl:flex-row xl:items-center">
            <div className="relative min-w-64 flex-1 xl:max-w-sm"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search Market ${type}...`} className="h-9 pl-9 text-xs" /></div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect label="Status" value={filters.status} onChange={(value) => updateFilter("status", value)} options={["new", "reviewing", "contacted", "pending_payment", "archived"]} />
              <FilterSelect label="Payment" value={filters.payment} onChange={(value) => updateFilter("payment", value)} options={["paid", "pending"]} />
              <FilterSelect label="Stage" value={filters.stage} onChange={(value) => updateFilter("stage", value)} options={["otp_sent", "form_submitted", "payment_successful"]} />
              {!isBuyer && <FilterSelect label="Role" value={filters.role} onChange={(value) => updateFilter("role", value)} options={["Manufacturer", "Exporter", "Sourcing Agent", "Quality Auditor"]} />}
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs"><Columns3 className="size-3.5" /> Columns <ChevronDown className="size-3" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44"><DropdownMenuLabel>Toggle columns</DropdownMenuLabel><DropdownMenuSeparator />{(Object.keys(columnLabels) as ColumnKey[]).map((key) => <DropdownMenuCheckboxItem key={key} checked={columns[key]} onCheckedChange={(checked) => setColumns((current) => ({ ...current, [key]: checked === true }))}>{columnLabels[key]}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>
              {hasFilters && <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-blue-600" onClick={resetFilters}><FilterX className="size-3.5" /> Reset</Button>}
            </div>
          </div>

          {isLoading ? <div className="p-4"><Skeleton className="h-80 w-full" /></div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/35">{columns.date && <TableHead>Date</TableHead>}{columns.person && <TableHead>{isBuyer ? "Buyer" : "Contact"}</TableHead>}{columns.company && <TableHead>Company</TableHead>}{columns.offering && <TableHead>{isBuyer ? "Requirement" : "Service / Roles"}</TableHead>}{columns.contact && <TableHead>Contact details</TableHead>}{columns.location && <TableHead>Location</TableHead>}{columns.status && <TableHead>Status</TableHead>}<TableHead className="sticky right-0 bg-muted/95 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{(data?.items || []).map((row: any) => <MarketRow key={row._id} row={row} isBuyer={isBuyer} columns={columns} onView={() => setDetailId(row._id)} onSetLogin={() => { setCredentialId(row._id); setLoginEmail(String(row.email || "")); setLoginPassword(""); setCredentialsOpen(true); }} />)}{!data?.items?.length && <TableRow><TableCell colSpan={Object.values(columns).filter(Boolean).length + 1} className="h-36 text-center text-sm text-muted-foreground">No Market {type} match these filters.</TableCell></TableRow>}</TableBody></Table></div>}

          <div className="flex items-center justify-between border-t px-4 py-3"><p className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.pages} · {pagination.total} total</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button size="sm" className="bg-blue-600 text-white hover:bg-blue-500" disabled={page >= pagination.pages || isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
        </CardContent>
      </Card>
      <Dialog open={Boolean(detailId)} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader><DialogTitle>Full Market {isBuyer ? "Buyer" : "Seller"} Data</DialogTitle><DialogDescription>Complete information submitted through SellersLogin Market.</DialogDescription></DialogHeader>
          {detailLoading ? <div className="flex h-48 items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin text-blue-600" /> Loading full record...</div> : detail ? <><DetailGrid data={detail} /><div className="mt-5 flex justify-end"><Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => { setCredentialId(detailId); setLoginEmail(String(detail.login_email || detail.email || "")); setLoginPassword(""); setCredentialsOpen(true); }}><KeyRound className="size-3.5" /> Reset login password</Button></div></> : <div className="py-12 text-center text-sm text-muted-foreground">Record could not be loaded.</div>}
        </DialogContent>
      </Dialog>
      <Dialog open={credentialsOpen} onOpenChange={(open) => { setCredentialsOpen(open); if (!open && !credentialsMutation.isPending) setCredentialId(null); }}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Set {isBuyer ? "Buyer" : "Seller"} Login</DialogTitle><DialogDescription>Create or update dashboard credentials and email them using the configured mail template and default sender.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); credentialsMutation.mutate(); }}><div className="space-y-1.5"><Label htmlFor="login-email" className="text-xs">Login email</Label><div className="relative"><Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="login-email" type="email" required value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} className="pl-9" /></div></div><div className="space-y-1.5"><Label htmlFor="login-password" className="text-xs">New password</Label><div className="relative"><Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input id="login-password" type={showLoginPassword ? "text" : "password"} required minLength={8} value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} className="pl-9 pr-10" placeholder="Minimum 8 characters" /><button type="button" aria-label={showLoginPassword ? "Hide password" : "Show password"} onClick={() => setShowLoginPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div><Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500" disabled={credentialsMutation.isPending}>{credentialsMutation.isPending ? <><Loader2 className="size-4 animate-spin" /> Saving & sending...</> : <><KeyRound className="size-4" /> Save and email credentials</>}</Button></form></DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string | null) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger size="sm" className={`h-9 min-w-28 text-xs ${value !== "all" ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : ""}`}><SelectValue placeholder={label}>{value === "all" ? label : pretty(value)}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">All {label}</SelectItem>{options.map((option) => <SelectItem key={option} value={option}>{pretty(option)}</SelectItem>)}</SelectContent></Select>;
}

function MarketRow({ row, isBuyer, columns, onView, onSetLogin }: { row: any; isBuyer: boolean; columns: Record<ColumnKey, boolean>; onView: () => void; onSetLogin: () => void }) {
  const name = isBuyer ? row.fullName : row.contactName;
  const offering = isBuyer ? row.lookingFor : row.titleOfServices;
  const paid = row.verificationPayment?.status === "paid";
  return <TableRow>{columns.date && <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(row.createdAt)}</TableCell>}{columns.person && <TableCell className="whitespace-nowrap text-xs font-semibold">{name || "—"}</TableCell>}{columns.company && <TableCell className="min-w-44 text-xs">{row.companyName || "—"}</TableCell>}{columns.offering && <TableCell className="min-w-64 max-w-80"><p className="line-clamp-2 text-xs font-medium">{offering || "—"}</p>{!isBuyer && row.selectedRoles?.length ? <p className="mt-1 text-[10px] text-muted-foreground">{row.selectedRoles.join(", ")}</p> : isBuyer && row.selectedSources?.length ? <p className="mt-1 text-[10px] text-muted-foreground">Sources: {row.selectedSources.join(", ")}</p> : null}</TableCell>}{columns.contact && <TableCell className="min-w-56"><p className="text-xs">{row.email || "—"}</p><p className="text-[10px] text-muted-foreground">{[row.countryCode, row.whatsapp].filter(Boolean).join(" ") || "—"}</p></TableCell>}{columns.location && <TableCell className="min-w-40 text-xs">{[row.city, row.state, row.country].filter(Boolean).join(", ") || "—"}</TableCell>}{columns.status && <TableCell><div className="flex min-w-32 flex-col items-start gap-1"><Badge variant="outline" className="text-[10px] capitalize">{pretty(row.status || row.registrationStage || "new")}</Badge><span className={`text-[10px] ${paid ? "text-emerald-600" : "text-amber-600"}`}>{paid ? "Paid" : "Payment pending"}</span></div></TableCell>}<TableCell className="sticky right-0 min-w-80 bg-background text-right"><div className="flex justify-end gap-2"><Button size="sm" onClick={onSetLogin} className="whitespace-nowrap bg-emerald-600 text-white hover:bg-emerald-500"><KeyRound className="size-3.5" /> Set login</Button><Button size="sm" onClick={onView} className="whitespace-nowrap bg-blue-600 text-white hover:bg-blue-500"><Eye className="size-3.5" /> View details</Button></div></TableCell></TableRow>;
}

function DetailGrid({ data }: { data: Record<string, unknown> }) {
  const priority = ["role", "login_email", "login_password_configured", "login_password", "last_emailed_password", "password_sent_mail"];
  const entries = Object.entries(data).filter(([key, value]) => key === "login_password" || key === "last_emailed_password" || (key !== "__v" && value !== "" && value !== null && value !== undefined && (!Array.isArray(value) || value.length))).sort(([a], [b]) => { const left = priority.indexOf(a); const right = priority.indexOf(b); return (left < 0 ? 99 : left) - (right < 0 ? 99 : right); });
  return <div className="grid gap-3 sm:grid-cols-2">{entries.map(([key, value]) => <div key={key} className={`rounded-lg border bg-muted/15 p-3 ${typeof value === "object" && value !== null ? "sm:col-span-2" : ""}`}><p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{fieldLabel(key)}</p>{key === "password_sent_mail" || key === "login_password_configured" ? <Badge className={value ? "bg-emerald-600 text-white" : "bg-slate-500 text-white"}>{key === "password_sent_mail" ? (value ? "Credentials email sent" : "Not sent") : (value ? "Password set · reset to change" : "No password set")}</Badge> : key === "login_password" ? <PasswordValue value={String(value || "")} /> : <DetailValue value={key === "createdAt" || key === "updatedAt" ? formatDate(String(value)) : value} />}</div>)}</div>;
}

function PasswordValue({ value }: { value: string }) {
  const [visible, setVisible] = React.useState(false);
  if (!value) return <p className="text-xs text-muted-foreground">No current password is saved in readable form. Reset login password to set and view one.</p>;
  return <div className="flex items-center gap-2"><code className="rounded bg-muted px-2 py-1 text-xs">{visible ? value : "••••••••••••"}</code><Button type="button" variant="ghost" size="icon" className="size-7" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button></div>;
}

function DetailValue({ value }: { value: unknown }): React.ReactNode {
  if (typeof value === "boolean") return <Badge variant="outline" className="text-[10px]">{value ? "Yes" : "No"}</Badge>;
  if (Array.isArray(value)) return <div className="flex flex-wrap gap-1.5">{value.map((item, index) => typeof item === "object" && item !== null ? <div key={index} className="w-full rounded-md border bg-background p-2"><DetailValue value={item} /></div> : <Badge key={index} variant="secondary" className="text-[10px]">{String(item)}</Badge>)}</div>;
  if (typeof value === "object" && value !== null) return <div className="grid gap-2 sm:grid-cols-2">{Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== "" && item !== null && item !== undefined).map(([key, item]) => <div key={key} className="rounded-md border bg-background p-2"><p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{fieldLabel(key)}</p><div className="mt-1 text-xs"><DetailValue value={item} /></div></div>)}</div>;
  const text = String(value ?? "—");
  if (/^https?:\/\//i.test(text)) return <a href={text} target="_blank" rel="noreferrer" className="break-all text-xs text-blue-600 underline">{text}</a>;
  return <span className="whitespace-pre-wrap break-words text-xs">{text}</span>;
}

function fieldLabel(value: string) { if (value === "last_emailed_password") return "Last Emailed Password (may not be current)"; return value.replace(/^_id$/, "Submission ID").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase()); }

function pretty(value: string) { return String(value).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value?: string) { if (!value) return "—"; return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
