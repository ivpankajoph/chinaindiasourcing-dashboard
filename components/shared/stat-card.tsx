import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color?: string;
}

export function StatCard({
  title,
  value,
  description,
  change,
  trend = "neutral",
  icon: Icon,
  color = "bg-primary/10 text-primary",
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden shadow-sm transition-all hover:shadow-md border-border/80">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          </div>
          <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
            <Icon className="size-5" />
          </div>
        </div>

        {(description || change) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {change && (
              <Badge
                variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
                className="h-5 px-1.5 text-[10px] font-medium gap-1"
              >
                {trend === "up" && <TrendingUp className="size-3" />}
                {trend === "down" && <TrendingDown className="size-3" />}
                {change}
              </Badge>
            )}
            {description && (
              <span className="text-muted-foreground truncate">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
