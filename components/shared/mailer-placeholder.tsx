import { Construction, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MailerPlaceholder({ title, description }: { title: string; description: string }) {
  return <div className="space-y-4"><div><h1 className="text-xl font-bold tracking-tight">{title}</h1><p className="text-xs text-muted-foreground">Admin-only Mailers workspace</p></div><Card className="border-blue-100 shadow-sm dark:border-blue-950"><CardHeader><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950"><Mail className="size-5" /></div><div><CardTitle className="text-base">{title}</CardTitle><CardDescription className="text-xs">{description}</CardDescription></div></div><Badge variant="outline" className="gap-1 text-blue-600"><Construction className="size-3" /> Ready for setup</Badge></div></CardHeader><CardContent><div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center text-sm text-muted-foreground">This section has been created. Its workflow and functionality can be added when you provide the requirements.</div></CardContent></Card></div>;
}
