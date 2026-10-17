"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Mail, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AutomationEmailsPage() {
  const [search, setSearch] = React.useState("");
  const [view, setView] = React.useState<"automations" | "history">(
    "automations",
  );
  const [selected, setSelected] = React.useState<any>(null);
  const [selectedAutomation, setSelectedAutomation] = React.useState<any>(null);
  const statusClass = (status: string) =>
    status === "active"
      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
      : status === "completed"
        ? "border-blue-200 bg-blue-100 text-blue-700"
        : status === "failed"
          ? "border-red-200 bg-red-100 text-red-700"
          : status === "paused"
            ? "border-amber-200 bg-amber-100 text-amber-700"
            : "border-slate-200 bg-slate-100 text-slate-700";
  const query = useQuery({
    queryKey: ["automation-emails", search],
    queryFn: async () => {
      const response = await fetch(
        `/api/emails/automations?search=${encodeURIComponent(search)}&limit=50`,
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error?.message || "Unable to load automation mails",
        );
      return body.data;
    },
  });
  const data = query.data || { automations: [], messages: [] };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Automation Mails</h1>
          <p className="text-sm text-muted-foreground">
            Automation configuration and every mail created by it.
          </p>
        </div>
        <Badge variant="outline">{data.messages.length} messages</Badge>
      </div>
      <div className="flex max-w-xl rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setView("automations")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${view === "automations" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Clock3 className="size-4" /> Automation data
        </button>
        <button
          type="button"
          onClick={() => setView("history")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${view === "history" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Mail className="size-4" /> Email history
        </button>
      </div>
      {view === "automations" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="size-4 text-blue-600" />
                Automation configuration
              </CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search automations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-3">Name</th>
                    <th className="p-3">Audience</th>
                    <th className="p-3">Template</th>
                    <th className="p-3">Interval</th>
                    <th className="p-3">Start / next run</th>
                    <th className="p-3">Recipient / leads</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.automations.length ? (
                    data.automations.map((item: any) => (
                      <tr key={item._id} className="border-b align-top">
                        <td className="p-3 font-semibold">
                          {item.name}
                          <div className="text-xs font-normal text-muted-foreground">
                            Created{" "}
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "—"}
                          </div>
                        </td>
                        <td className="p-3 capitalize">{item.audience}</td>
                        <td className="p-3 font-mono text-xs">
                          {item.templateAction}
                        </td>
                        <td className="p-3 capitalize">
                          {item.frequency}
                          <div className="text-xs text-muted-foreground">
                            {item.schedule?.time
                              ? `at ${item.schedule.time}`
                              : item.frequency === "hour"
                                ? `every ${item.schedule?.everyHours || 1}h`
                                : ""}
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-3">
                          {item.startsAt
                            ? new Date(item.startsAt).toLocaleString()
                            : "—"}
                          <div className="text-xs text-muted-foreground">
                            Next:{" "}
                            {item.status === "completed"
                              ? "Completed"
                              : item.nextRunAt
                                ? new Date(item.nextRunAt).toLocaleString()
                                : "—"}
                          </div>
                        </td>
                        <td className="p-3">
                          {item.audience === "everyone"
                            ? item.recipientEmail
                            : `${(item.leadIds || []).length} selected leads`}
                          <div className="text-xs text-muted-foreground">
                            Sent: {item.sentCount || 0}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`border ${statusClass(item.status)}`}
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAutomation(item)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-10 text-center text-muted-foreground"
                      >
                        No automation records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4 text-blue-600" />
                Automation email history
              </CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search automation mails..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-3">Automation</th>
                    <th className="p-3">To</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Folder</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.messages.length ? (
                    data.messages.map((message: any) => (
                      <tr key={message._id} className="border-b">
                        <td className="p-3 font-medium">
                          {message.automationName || "Automation"}
                          <div className="text-xs text-muted-foreground">
                            {message.automationAudience}
                          </div>
                        </td>
                        <td className="p-3">{(message.to || []).join(", ")}</td>
                        <td className="max-w-sm truncate p-3">
                          {message.subject}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              message.folder === "unsent"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {message.folder}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap p-3 text-muted-foreground">
                          {new Date(message.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelected(message)}
                          >
                            <Eye className="mr-1 size-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-muted-foreground"
                      >
                        No automation mails found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog
        open={Boolean(selectedAutomation)}
        onOpenChange={(open) => !open && setSelectedAutomation(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAutomation?.name}</DialogTitle>
            <DialogDescription>
              Complete automation configuration
            </DialogDescription>
          </DialogHeader>
          {selectedAutomation && (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge
                  className={`mt-1 border ${statusClass(selectedAutomation.status)}`}
                >
                  {selectedAutomation.status}
                </Badge>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Audience</div>
                <div className="mt-1 font-medium capitalize">
                  {selectedAutomation.audience}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">
                  Template action
                </div>
                <div className="mt-1 font-mono text-xs">
                  {selectedAutomation.templateAction}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Frequency</div>
                <div className="mt-1 capitalize">
                  {selectedAutomation.frequency}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Start date</div>
                <div className="mt-1">
                  {selectedAutomation.startsAt
                    ? new Date(selectedAutomation.startsAt).toLocaleString()
                    : "—"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Next run</div>
                <div className="mt-1">
                  {selectedAutomation.status === "completed"
                    ? "Completed"
                    : selectedAutomation.nextRunAt
                      ? new Date(selectedAutomation.nextRunAt).toLocaleString()
                      : "—"}
                </div>
              </div>
              <div className="rounded-lg border p-3 sm:col-span-2">
                <div className="text-xs text-muted-foreground">
                  Schedule settings
                </div>
                <pre className="mt-1 whitespace-pre-wrap text-xs">
                  {JSON.stringify(selectedAutomation.schedule || {}, null, 2)}
                </pre>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">
                  Recipient / leads
                </div>
                <div className="mt-1">
                  {selectedAutomation.audience === "everyone"
                    ? selectedAutomation.recipientEmail
                    : `${(selectedAutomation.leadIds || []).length} selected leads`}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Sent count</div>
                <div className="mt-1 font-semibold">
                  {selectedAutomation.sentCount || 0}
                </div>
              </div>
              {selectedAutomation.lastError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 sm:col-span-2">
                  <div className="text-xs font-semibold">Last error</div>
                  <div className="mt-1">{selectedAutomation.lastError}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription>
              {selected?.automationName} · {selected?.automationAudience} ·{" "}
              {selected && new Date(selected.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selected?.error && (
            <p className="rounded bg-red-50 p-3 text-sm text-red-700">
              {selected.error}
            </p>
          )}
          {selected?.html ? (
            <iframe
              title="Automation email"
              sandbox=""
              className="min-h-96 w-full rounded border bg-white"
              srcDoc={selected.html}
            />
          ) : (
            <pre className="whitespace-pre-wrap rounded bg-muted p-4">
              {selected?.text}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
