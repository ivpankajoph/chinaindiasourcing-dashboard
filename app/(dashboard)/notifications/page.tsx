"use client";

import { useQuery } from "@tanstack/react-query";
import { NotificationsModule } from "@/components/notifications/notification-module";

export default function NotificationsPage() {
  const { data: user } = useQuery({ queryKey: ["current-admin"], queryFn: async () => { const response = await fetch("/api/auth/me"); if (!response.ok) throw new Error("Unauthorized"); return (await response.json()).data; } });
  return <NotificationsModule isAdmin={user?.roleKey === "super_admin"} />;
}
