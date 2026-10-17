"use client";
import * as React from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Code2, Eye, Loader2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const starterHtml =
  "<h1>Welcome, {{name}}</h1><p>Thank you for using China India Sourcing.</p><p>Your message goes here.</p>";
const previewLogoUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjQ2IiBoZWlnaHQ9IjQ2IiByeD0iMTMiIGZpbGw9IiNmMGY5ZmYiIHN0cm9rZT0iI2JmZGJmZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTkuNSAxOC41QzEzLjUgOS41IDI3IDcuNSAzNyAxNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0zOC41IDI5LjVDMzQuNSAzOC41IDIxIDQwLjUgMTEgMzQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBlYTVlOSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJtMzAuNSAxMS41IDYuNyAyLjMtMi4zIDYuN00xNy41IDM2LjVsLTYuNy0yLjMgMi4zLTYuNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWU0MGFmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMi43Ii8+PGNpcmNsZSBjeD0iMTEiIGN5PSIxOCIgcj0iMyIgZmlsbD0iI2Y1OWEwYiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjM3IiBjeT0iMzAiIHI9IjMiIGZpbGw9IiMyMmM1NWUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L3N2Zz4=";
const previewHtml = (html: string, subject: string) => {
  const content = html
    .replace(/{{\s*name\s*}}/gi, "Aisha Al Mansoori")
    .replace(/{{\s*email\s*}}/gi, "aisha@example.com");
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;padding:24px 12px;font-family:Arial,sans-serif;color:#172033"><div style="max-width:640px;margin:auto;background:white;border:1px solid #dce5f2;border-radius:16px;overflow:hidden"><div style="background:#2563eb;padding:20px 24px;color:white"><img src="${previewLogoUrl}" alt="China India Sourcing" width="42" height="42" style="display:block;margin-bottom:10px"><div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.85">China India Sourcing</div></div><div style="padding:24px"><div style="font-size:12px;color:#64748b;margin-bottom:18px">Subject: ${subject.replace(/</g, "&lt;")}</div>${content}</div><div style="border-top:1px solid #e2e8f0;padding:18px 24px;color:#64748b;font-size:13px;line-height:1.6">Regards,<br><strong style="color:#172033">China India Sourcing Team</strong><br>Import &amp; Export Network</div></div></body></html>`;
};
export default function NewTemplatePage() {
  const [form, setForm] = React.useState({
    actionName: "",
    name: "",
    description: "",
    subject: "",
    html: starterHtml,
    text: "Welcome, {{name}}\n\nThank you for using China India Sourcing.\n\nYour message goes here.",
    variables: "name",
  });
  const [mode, setMode] = React.useState<"visual" | "code">("visual");
  const [viewMode, setViewMode] = React.useState<"create" | "preview">(
    "create",
  );
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const create = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/mailers/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          variables: form.variables
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message || "Unable to create template");
      return body;
    },
    onSuccess: () => {
      toast.success("Template created with logo and signature");
      window.location.assign("/mailers/templates");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
          <Link href="/mailers/templates">
            <ArrowLeft className="size-4" />
            Back to templates
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Create email template
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create by visual editing or directly with HTML code. Logo and
          signature are added to every email automatically.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="size-4 text-blue-600" />
              Template details
            </CardTitle>
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                type="button"
                size="sm"
                variant={viewMode === "create" ? "default" : "ghost"}
                onClick={() => setViewMode("create")}
                className="h-8"
              >
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewMode === "preview" ? "default" : "ghost"}
                onClick={() => setViewMode("preview")}
                className="h-8"
              >
                <Eye className="size-4" />
                Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "create" ? (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                create.mutate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Template name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="Buyer welcome email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Action name</Label>
                  <Input
                    required
                    value={form.actionName}
                    onChange={(event) =>
                      update("actionName", event.target.value)
                    }
                    placeholder="Buyer_Welcome"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Unique identifier used when sending.
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  placeholder="Describe when this template is used"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email subject</Label>
                <Input
                  required
                  value={form.subject}
                  onChange={(event) => update("subject", event.target.value)}
                  placeholder="Welcome to China India Sourcing, {{name}}"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Variables</Label>
                <Input
                  value={form.variables}
                  onChange={(event) => update("variables", event.target.value)}
                  placeholder="name, email, order_id"
                />
                <p className="text-[11px] text-muted-foreground">
                  Use placeholders like {`{{name}}`} in subject and content.
                </p>
              </div>
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as "visual" | "code")}
              >
                <TabsList>
                  <TabsTrigger value="visual">
                    <Eye className="size-4" />
                    Visual editor
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <Code2 className="size-4" />
                    HTML code
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="mt-3">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{ __html: form.html }}
                    onInput={(event) =>
                      update("html", event.currentTarget.innerHTML)
                    }
                    className="min-h-[360px] rounded-lg border bg-white p-8 text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Edit the message directly. Branding is inserted
                    automatically around your content.
                  </p>
                </TabsContent>
                <TabsContent value="code" className="mt-3">
                  <Textarea
                    value={form.html}
                    onChange={(event) => update("html", event.target.value)}
                    className="min-h-[360px] font-mono text-xs"
                  />
                </TabsContent>
              </Tabs>
              <div className="space-y-1.5">
                <Label>Plain-text fallback</Label>
                <Textarea
                  value={form.text}
                  onChange={(event) => update("text", event.target.value)}
                  className="min-h-32 font-mono text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button asChild type="button" variant="outline">
                  <Link href="/mailers/templates">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={create.isPending}
                  className="bg-blue-600 text-white hover:bg-blue-500"
                >
                  {create.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Create template
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Subject preview</p>
                <p className="font-semibold">
                  {form.subject || "Your email subject"}
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border bg-muted/20">
                <iframe
                  title="Email template preview"
                  sandbox=""
                  srcDoc={previewHtml(
                    form.html,
                    form.subject || "Your email subject",
                  )}
                  className="h-[680px] w-full bg-white"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
