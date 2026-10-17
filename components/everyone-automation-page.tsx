"use client";
import * as React from "react";
import { Mail, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";
import { AutomationScheduleFields } from "@/components/automation-schedule-fields";
export default function EveryoneAutomationPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
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
  const [tab, setTab] = React.useState<"create" | "scheduled">("create");
  const itemsQuery = useQuery({
    queryKey: ["automations", "everyone"],
    queryFn: async () => {
      const response = await fetch("/api/automations?audience=everyone");
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message || "Unable to load automations");
      return body.data?.items || [];
    },
  });
  const items: any[] = itemsQuery.data || [];
  const [templates, setTemplates] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch("/api/mailers/templates?limit=100")
      .then((r) => r.json())
      .then((b) =>
        setTemplates((b.data?.items || []).filter((x: any) => x.enabled)),
      );
  }, []);
  const create = () => {
    if (!name || !email || !template || !startAt)
      return toast.error("Enter name, email, template and schedule");
    if (new Date(startAt).getTime() <= Date.now())
      return toast.error("Choose a future start date and time");
    if (interval === "week" && !schedule.days?.length)
      return toast.error("Choose at least one weekday");
    if (interval === "year" && !schedule.months?.length)
      return toast.error("Choose at least one month");
    const recipients = email
      .split(/[,;\n]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (
      !recipients.length ||
      recipients.some((value) => !/^\S+@\S+\.\S+$/.test(value))
    )
      return toast.error("Enter valid email addresses separated by commas");
    void (async () => {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          recipientEmail: email,
          audience: "everyone",
          templateAction: template,
          startsAt: new Date(startAt).toISOString(),
          frequency: interval,
          schedule,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        return toast.error(
          body.error?.message || "Unable to create automation",
        );
      await itemsQuery.refetch();
      setName("");
      setEmail("");
      setTab("scheduled");
      toast.success("Automation scheduled");
    })().catch((error) =>
      toast.error(error.message || "Unable to schedule automation"),
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
    await itemsQuery.refetch();
    toast.success(
      nextStatus === "paused" ? "Automation paused" : "Automation resumed",
    );
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Automation for Everyone</h1>
        <p className="text-muted-foreground">
          Send any mailer template to any email address.
        </p>
      </div>
      <div className="flex w-full max-w-3xl rounded-xl bg-muted p-1">
        <Button
          variant={tab === "create" ? "default" : "ghost"}
          className="flex-1 transition-all duration-300"
          onClick={() => setTab("create")}
        >
          <Play className="size-4" />
          Create automation
        </Button>
        <Button
          variant={tab === "scheduled" ? "default" : "ghost"}
          className="flex-1 transition-all duration-300"
          onClick={() => setTab("scheduled")}
        >
          <Mail className="size-4" />
          Scheduled automations
          {items.length > 0 && <Badge className="ml-1">{items.length}</Badge>}
        </Button>
      </div>
      {tab === "create" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-blue-600" />
              Create email automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Automation name</Label>
              <Input
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Partner follow-up"
              />
            </div>
            <div>
              <Label>Recipient email</Label>
              <Input
                className="mt-1"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="one@example.com, two@example.com"
              />
            </div>
            <div>
              <Label>Email template</Label>
              <Select
                value={template}
                onValueChange={(v) => setTemplate(v || "")}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent className="w-[420px]">
                  {templates.map((x) => (
                    <SelectItem key={x._id} value={x.actionName}>
                      {x.name} · {x.actionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start date and time</Label>
              <Input
                className="mt-1"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <AutomationScheduleFields
              frequency={interval}
              setFrequency={setInterval}
              schedule={schedule}
              setSchedule={setSchedule}
            />
            <Button className="w-full bg-blue-600 text-white" onClick={create}>
              <Play className="size-4" />
              Create automation
            </Button>
          </CardContent>
        </Card>
      )}
      {tab === "scheduled" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Scheduled automations</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length ? (
              items.map((x, i) => (
                <div
                  key={i}
                  className="mb-2 flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <b>{x.name}</b>
                    <p className="text-sm text-muted-foreground">
                      {x.recipientEmail} · {x.templateAction} · {x.frequency} ·
                      Next: {new Date(x.nextRunAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No automations created yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
