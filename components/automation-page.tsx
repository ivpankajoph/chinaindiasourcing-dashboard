"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Loader2, Mail, Pause, Play, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AutomationScheduleFields } from "@/components/automation-schedule-fields";
type Props = { audience: "buyers" | "sellers" };
export default function AutomationPage({ audience }: Props) {
  const oppositeLeadKind = audience === "buyers" ? "sellers" : "buyers";
  const [tab, setTab] = React.useState<"create" | "scheduled">("create");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search.trim());
  const [leadPage, setLeadPage] = React.useState(1);
  const [name, setName] = React.useState("");
  const [template, setTemplate] = React.useState("");
  const [startAt, setStartAt] = React.useState("");
  const [interval, setInterval] = React.useState("once");
  const [schedule, setSchedule] = React.useState<any>({
    time: "09:00",
    minute: 0,
    everyHours: 1,
    everyDays: 1,
    everyWeeks: 1,
    days: [],
    dayOfMonth: 1,
    months: [],
  });
  const automationsQuery = useQuery({
    queryKey: ["automations", audience],
    queryFn: async () => {
      const response = await fetch(`/api/automations?audience=${audience}`);
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message || "Unable to load automations");
      return body.data?.items || [];
    },
  });
  const automations: any[] = automationsQuery.data || [];
  const templatesQuery = useQuery({
    queryKey: ["automation-templates"],
    queryFn: async () =>
      (await (await fetch("/api/mailers/templates?limit=100")).json()).data
        ?.items || [],
  });
  const templates = (templatesQuery.data || []).filter(
    (item: any) => item.enabled && (item.type !== "promo_temp" || item.promoAudience === audience),
  );
  const selectedTemplate = templates.find((item: any) => item.actionName === template);
  const promoMode = selectedTemplate?.type === "promo_temp";
  const pickerKind = promoMode ? audience : oppositeLeadKind;
  const leadsQuery = useQuery({
    queryKey: ["automation-leads", pickerKind, leadPage, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "25", page: String(leadPage) });
      if (deferredSearch) params.set("search", deferredSearch);
      const response = await fetch(`/api/${pickerKind}?${params}`);
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message || "Unable to load leads");
      return {
        items: body.data?.items || body.data || [],
        pagination: body.data?.pagination || {},
      };
    },
  });
  const leads = leadsQuery.data?.items || [];
  const leadPagination = leadsQuery.data?.pagination || {};
  const id = (x: any) => String(x._id || x.id);
  const toggle = (v: string) =>
    setSelected((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));
  const selectAll = () => {
    const ids = leads.map(id);
    setSelected((a) =>
      ids.every((x: string) => a.includes(x))
        ? a.filter((x) => !ids.includes(x))
        : [...new Set([...a, ...ids])],
    );
  };
  const create = () => {
    if (!name || !template || !startAt || !selected.length)
      return toast.error("Choose name, template, schedule and leads");
    if (new Date(startAt).getTime() <= Date.now())
      return toast.error("Choose a future start date and time");
    if (interval === "week" && !schedule.days?.length)
      return toast.error("Choose at least one weekday");
    if (interval === "year" && !schedule.months?.length)
      return toast.error("Choose at least one month");
    void (async () => {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          audience,
          templateAction: template,
          startsAt: new Date(startAt).toISOString(),
          frequency: interval,
          schedule,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          leadIds: promoMode ? [] : selected,
          recipientIds: promoMode ? selected : [],
        }),
      });
      const body = await response.json();
      if (!response.ok)
        return toast.error(
          body.error?.message || "Unable to create automation",
        );
      await automationsQuery.refetch();
      setTab("scheduled");
      setSelected([]);
      setName("");
      toast.success("Automation scheduled");
    })().catch((error) =>
      toast.error(error.message || "Unable to create automation"),
    );
  };
  const toggleAutomation = async (item: any) => {
    const nextStatus = item.status === "active" ? "paused" : "active";
    const response = await fetch(`/api/automations/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const body = await response.json();
    if (!response.ok)
      return toast.error(body.error?.message || "Unable to update automation");
    await automationsQuery.refetch();
    toast.success(
      nextStatus === "paused" ? "Automation paused" : "Automation resumed",
    );
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Send Automations to {audience === "buyers" ? "Buyers" : "Sellers"}
        </h1>
        <p className="text-muted-foreground">
          Promo templates send their saved {audience === "buyers" ? "seller" : "buyer"} leads to the {audience} you select below.
        </p>
      </div>
      <div className="flex w-full max-w-xl rounded-xl bg-muted p-1">
        <Button
          variant={tab === "create" ? "default" : "ghost"}
          className="flex-1 transition-all duration-300 ease-out"
          onClick={() => setTab("create")}
        >
          <CalendarClock className="size-4" />
          Create automation
        </Button>
        <Button
          variant={tab === "scheduled" ? "default" : "ghost"}
          className="flex-1 transition-all duration-300 ease-out"
          onClick={() => setTab("scheduled")}
        >
          <Mail className="size-4" />
          Scheduled automations
          {automations.length > 0 && (
            <Badge className="ml-1">{automations.length}</Badge>
          )}
        </Button>
      </div>
      {tab === "create" ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Create automation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label>Automation name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lead campaign"
              />
              <Label>Email template</Label>
              <Select
                value={template}
                onValueChange={(v) => {
                  setTemplate(v || "");
                  setSelected([]);
                  setSearch("");
                  setLeadPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent className="w-[420px] max-w-[calc(100vw-2rem)]">
                  {templates.map((x: any) => (
                    <SelectItem key={x._id} value={x.actionName}>
                      {x.name} · {x.actionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {promoMode && (
                <p className="text-xs text-muted-foreground">
                  Email will contain the {audience === "sellers" ? "buyer" : "seller"} leads saved in this template ({audience === "sellers" ? selectedTemplate.buyerIds?.length || 0 : selectedTemplate.sellerIds?.length || 0}). Select recipients on the right.
                </p>
              )}
              {selectedTemplate && !promoMode && (
                <p className="text-xs text-muted-foreground">
                  Standard automations send the selected lead data to all eligible {audience}.
                </p>
              )}
              <Label>Start date and time</Label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
              <AutomationScheduleFields
                frequency={interval}
                setFrequency={setInterval}
                schedule={schedule}
                setSchedule={setSchedule}
              />
              <Button
                className="mt-2 w-full bg-blue-600 text-white"
                onClick={create}
              >
                <Play className="size-4" />
                Create automation
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Users className="size-5 text-blue-600" />
                {promoMode ? `Select ${audience} to receive this email` : `Select ${oppositeLeadKind} leads`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {promoMode && <p className="mb-3 text-sm text-muted-foreground">These accounts receive the email. The lead cards come from the selected promo template.</p>}
              <div className="mb-3 flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setLeadPage(1);
                  }}
                  placeholder="Search company, person, email or location"
                />
                <Button type="button" variant="outline" onClick={selectAll} disabled={!leads.length || leadsQuery.isFetching}>
                  {leads.length &&
                  leads.every((x: any) =>
                    selected.includes(id(x)) ? true : false,
                  )
                    ? "Clear all"
                    : "Select all"}
                </Button>
              </div>
              <div className="max-h-[480px] space-y-2 overflow-y-auto">
                {leadsQuery.isLoading
                  ? Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className="flex animate-pulse gap-3 rounded-lg border p-4"
                      >
                        <div className="size-8 rounded-lg bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 rounded bg-muted" />
                          <div className="h-3 w-1/2 rounded bg-muted" />
                          <div className="h-3 w-5/6 rounded bg-muted" />
                        </div>
                      </div>
                    ))
                  : leads.map((x: any) => (
                      <label
                        key={id(x)}
                        className="flex gap-3 rounded-lg border p-3"
                      >
                        <Checkbox
                          checked={selected.includes(id(x))}
                          onCheckedChange={() => toggle(id(x))}
                        />
                        <img
                          src="/logo-mark.svg"
                          alt="China India Sourcing"
                          className="mt-0.5 size-8 shrink-0 rounded-lg border bg-white p-1"
                        />
                        <span>
                          <b className="block">
                            {x.companyName ||
                              x.company ||
                              "Company not provided"}
                          </b>
                          <span className="block text-sm">
                            {x.fullName ||
                              x.contactName ||
                              x.name ||
                              "Unnamed contact"}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {[
                              x.email,
                              x.whatsapp,
                              [x.city, x.state, x.country]
                                .filter(Boolean)
                                .join(", "),
                            ]
                              .filter(Boolean)
                              .join(" · ") || "No contact details"}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {x.titleOfServices || x.lookingFor || ""}
                          </span>
                        </span>
                      </label>
                    ))}
                {!leadsQuery.isLoading && !leadsQuery.isError && !leads.length && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No {pickerKind} match your search.
                  </p>
                )}
                {leadsQuery.isError && (
                  <p className="py-10 text-center text-sm text-destructive">
                    Unable to load leads. Please try again.
                  </p>
                )}
              </div>
              {leadsQuery.isFetching && !leadsQuery.isLoading && (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading leads...
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>
                  Page {leadPagination.page || leadPage} of{" "}
                  {leadPagination.pages || 1} · {leadPagination.total || 0}{" "}
                  total leads
                </span>
                <span className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={leadPage <= 1 || leadsQuery.isFetching}
                    onClick={() => setLeadPage((page) => page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      leadPage >= (leadPagination.pages || 1) ||
                      leadsQuery.isFetching
                    }
                    onClick={() => setLeadPage((page) => page + 1)}
                  >
                    Next
                  </Button>
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {selected.length} lead(s) selected
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-blue-600" />
              Scheduled automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {automations.length ? (
              automations.map((x: any, i: number) => (
                <div
                  key={i}
                  className="mb-2 flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{x.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {x.templateAction} · {x.frequency} ·{" "}
                      {x.recipientIds?.length ? `${x.recipientIds.length} recipient(s)` : `${x.leadIds?.length || 0} lead(s)`} ·{" "}
                      {x.nextRunAt
                        ? `Next: ${new Date(x.nextRunAt).toLocaleString()}`
                        : x.status}
                    </p>
                  </div>
                  <Badge
                    className={
                      x.status === "active"
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {x.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void toggleAutomation(x)}
                  >
                    {x.status === "active" ? (
                      <>
                        <Pause className="size-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5" /> Resume
                      </>
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-muted-foreground">
                No automations created yet. Use Create automation to add one.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
