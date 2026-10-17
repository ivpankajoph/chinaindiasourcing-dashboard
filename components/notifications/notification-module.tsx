"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellRing, CheckCheck, CircleAlert, Info, Loader2, Megaphone, Send, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type NotificationItem = {
  id: string;
  audience: "all" | "admin" | "buyer" | "seller";
  title: string;
  message: string;
  category: "info" | "success" | "warning" | "action" | "system";
  priority: "normal" | "high";
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string | null;
  read: boolean;
};

type NotificationData = { items: NotificationItem[]; unreadCount: number };

async function notificationRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Notification request failed");
  return body;
}

export function useNotifications(limit = 30) {
  return useQuery<NotificationData>({
    queryKey: ["notifications", limit],
    queryFn: async () => (await notificationRequest(`/api/notifications?limit=${limit}`)).data,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

const categoryStyle = {
  info: { icon: Info, className: "bg-blue-50 text-blue-600 dark:bg-blue-950/50" },
  success: { icon: Sparkles, className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" },
  warning: { icon: TriangleAlert, className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50" },
  action: { icon: BellRing, className: "bg-violet-50 text-violet-600 dark:bg-violet-950/50" },
  system: { icon: Megaphone, className: "bg-slate-100 text-slate-600 dark:bg-slate-800" },
};

function NotificationRow({ item, compact = false, admin = false }: { item: NotificationItem; compact?: boolean; admin?: boolean }) {
  const queryClient = useQueryClient();
  const config = categoryStyle[item.category] || categoryStyle.info;
  const Icon = config.icon;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  const read = useMutation({ mutationFn: () => notificationRequest(`/api/notifications/${item.id}/read`, { method: "PATCH" }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: () => notificationRequest(`/api/notifications/${item.id}`, { method: "DELETE" }), onSuccess: () => { refresh(); toast.success("Notification deleted"); }, onError: (error: Error) => toast.error(error.message) });
  const content = (
    <div className={`flex gap-3 ${compact ? "p-3" : "p-4"}`}>
      <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${config.className}`}><Icon className="size-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2"><p className="flex-1 text-sm font-semibold leading-5">{item.title}</p>{!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600" />}</div>
        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">{item.message}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
          {item.priority === "high" && <Badge variant="outline" className="h-5 border-amber-300 text-[9px] text-amber-700">Important</Badge>}
          {!compact && <Badge variant="outline" className="h-5 text-[9px] capitalize">{item.audience === "all" ? "Everyone" : item.audience}</Badge>}
        </div>
        <div className="mt-2 flex gap-2">
          {item.actionUrl && <Button asChild size="sm" variant="outline" className="h-7 text-xs"><Link href={item.actionUrl} onClick={() => !item.read && read.mutate()}>Open</Link></Button>}
          {!item.read && <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={read.isPending} onClick={() => read.mutate()}>Mark read</Button>}
          {admin && <Button size="sm" variant="ghost" className="ml-auto h-7 text-xs text-destructive" disabled={remove.isPending} onClick={() => remove.mutate()}><Trash2 className="size-3" />Delete</Button>}
        </div>
      </div>
    </div>
  );
  return <div className={`${!item.read ? "bg-blue-50/40 dark:bg-blue-950/10" : ""} border-b last:border-b-0`}>{content}</div>;
}

export function NotificationBell() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useNotifications(8);
  const markAll = useMutation({
    mutationFn: () => notificationRequest("/api/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const count = data?.unreadCount || 0;
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label={`Notifications${count ? `, ${count} unread` : ""}`} className="relative size-9 rounded-xl text-muted-foreground" />}>
        <Bell className="size-4.5" />
        {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold leading-4.5 text-white">{count > 99 ? "99+" : count}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,390px)] gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b p-3"><div><p className="text-sm font-semibold">Notifications</p><p className="text-[11px] text-muted-foreground">{count ? `${count} unread` : "You’re all caught up"}</p></div>{count > 0 && <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={markAll.isPending} onClick={() => markAll.mutate()}><CheckCheck className="size-3.5" />Read all</Button>}</div>
        <div className="max-h-[420px] overflow-y-auto">{isLoading ? <div className="flex h-32 items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div> : data?.items.length ? data.items.map((item) => <NotificationRow key={item.id} item={item} compact />) : <div className="px-6 py-10 text-center"><Bell className="mx-auto size-7 text-muted-foreground" /><p className="mt-2 text-sm font-medium">No notifications yet</p><p className="mt-1 text-xs text-muted-foreground">Updates and account activity will appear here.</p></div>}</div>
        <Button asChild variant="ghost" className="h-10 rounded-none border-t text-xs"><Link href="/notifications">View all notifications</Link></Button>
      </PopoverContent>
    </Popover>
  );
}

function NotificationComposer() {
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState({ audience: "all", category: "info", priority: "normal", title: "", message: "", actionUrl: "", expiresAt: "" });
  const publish = useMutation({
    mutationFn: () => notificationRequest("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, expiresAt: form.expiresAt || null }) }),
    onSuccess: () => { setForm({ audience: "all", category: "info", priority: "normal", title: "", message: "", actionUrl: "", expiresAt: "" }); queryClient.invalidateQueries({ queryKey: ["notifications"] }); toast.success("Notification published"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const field = (name: keyof typeof form, value: string) => setForm((current) => ({ ...current, [name]: value }));
  return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Send className="size-4 text-blue-600" />Publish notification</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); publish.mutate(); }}><div className="grid gap-4 sm:grid-cols-3"><div className="space-y-1.5"><Label>Audience</Label><Select value={form.audience} onValueChange={(value) => field("audience", value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Everyone</SelectItem><SelectItem value="admin">Admins</SelectItem><SelectItem value="buyer">Buyers</SelectItem><SelectItem value="seller">Sellers</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label>Category</Label><Select value={form.category} onValueChange={(value) => field("category", value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">Information</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="action">Action required</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label>Priority</Label><Select value={form.priority} onValueChange={(value) => field("priority", value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">Important</SelectItem></SelectContent></Select></div></div><div className="space-y-1.5"><Label>Title</Label><Input required maxLength={120} value={form.title} onChange={(event) => field("title", event.target.value)} placeholder="Short notification title" /></div><div className="space-y-1.5"><Label>Message</Label><Textarea required maxLength={2000} rows={4} value={form.message} onChange={(event) => field("message", event.target.value)} placeholder="What should recipients know?" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label>Action link <span className="font-normal text-muted-foreground">(optional)</span></Label><Input value={form.actionUrl} onChange={(event) => field("actionUrl", event.target.value)} placeholder="/billing" /></div><div className="space-y-1.5"><Label>Expires <span className="font-normal text-muted-foreground">(optional)</span></Label><Input type="datetime-local" value={form.expiresAt} onChange={(event) => field("expiresAt", event.target.value)} /></div></div><Button type="submit" className="bg-blue-600 text-white hover:bg-blue-500" disabled={publish.isPending}>{publish.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}{publish.isPending ? "Publishing..." : "Publish notification"}</Button></form></CardContent></Card>;
}

export function NotificationsModule({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useNotifications(100);
  const markAll = useMutation({ mutationFn: () => notificationRequest("/api/notifications/read-all", { method: "PATCH" }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">Notifications</h1><p className="mt-1 text-sm text-muted-foreground">Account updates, marketplace activity, announcements, reminders, and actions.</p></div>{(data?.unreadCount || 0) > 0 && <Button variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}><CheckCheck className="size-4" />Mark all as read</Button>}</div>{isAdmin && <NotificationComposer />}<Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Notification history</CardTitle><Badge variant="outline">{data?.unreadCount || 0} unread</Badge></div></CardHeader><CardContent className="p-0">{isLoading ? <div className="flex h-40 items-center justify-center"><Loader2 className="size-5 animate-spin" /></div> : isError ? <div className="flex items-center justify-center gap-2 p-10 text-sm text-destructive"><CircleAlert className="size-4" />Notifications could not be loaded.</div> : data?.items.length ? data.items.map((item) => <NotificationRow key={item.id} item={item} admin={isAdmin} />) : <div className="p-12 text-center"><Bell className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No notifications</p><p className="mt-1 text-xs text-muted-foreground">New updates will appear here.</p></div>}</CardContent></Card></div>;
}
