"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  BellRing,
  CircleDollarSign,
  ChevronDown,
  CircleAlert,
  CreditCard,
  Crown,
  FileText,
  Globe,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Send,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Users,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-module";
import { toast } from "sonner";

const navigation = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Notifications", href: "/notifications", icon: BellRing },
      { title: "Revenue", href: "/revenue", icon: CircleDollarSign },
    ],
  },
  {
    label: "Manage Marketplace",
    items: [
      { title: "Market Buyers", href: "/buyers", icon: Users },
      { title: "Market Sellers", href: "/sellers", icon: Store },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mailersOpen, setMailersOpen] = React.useState(
    pathname.startsWith("/mailers"),
  );
  const [emailsOpen, setEmailsOpen] = React.useState(
    pathname.startsWith("/emails"),
  );
  const [automationOpen, setAutomationOpen] = React.useState(true);
  const [websiteComingSoon, setWebsiteComingSoon] = React.useState(false);
  const [planOpen, setPlanOpen] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(256);
  const [resizingSidebar, setResizingSidebar] = React.useState(false);
  const sidebarStorageReady = React.useRef(false);
  React.useEffect(() => {
    if (!sidebarStorageReady.current) {
      sidebarStorageReady.current = true;
      const savedWidth = Number(
        window.localStorage.getItem("cis-admin-sidebar-width"),
      );
      if (savedWidth >= 220 && savedWidth <= 400) setSidebarWidth(savedWidth);
      return;
    }
    window.localStorage.setItem(
      "cis-admin-sidebar-width",
      String(sidebarWidth),
    );
  }, [sidebarWidth]);
  React.useEffect(() => {
    if (!resizingSidebar) return;
    const resize = (event: MouseEvent) =>
      setSidebarWidth(Math.min(400, Math.max(220, event.clientX)));
    const stop = () => setResizingSidebar(false);
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stop);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stop);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizingSidebar]);
  const { data: user, isError } = useQuery({
    queryKey: ["current-admin"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Unauthorized");
      return (await response.json()).data;
    },
    retry: false,
  });
  React.useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);
  const logout = useMutation({
    mutationFn: () => fetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      toast.info("Logged out successfully");
      router.push("/login");
    },
  });
  const startPayment = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/member/payment", { method: "POST" });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error?.message ||
            body.message ||
            "Unable to open payment receipt",
        );
      return body.data;
    },
    onSuccess: (data) => {
      if (data?.status === "paid") {
        toast.success("Premium Plan is already active");
        queryClient.invalidateQueries({ queryKey: ["current-admin"] });
        setPlanOpen(false);
        return;
      }
      if (data?.paymentUrl) window.location.assign(data.paymentUrl);
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const roleNavigation = !user
    ? [
        {
          label: "Overview",
          items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "Notifications", href: "/notifications", icon: BellRing },
          ],
        },
      ]
    : user.roleKey === "buyer"
      ? [
          {
            label: "Overview",
            items: [
              { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
              {
                title: "Notifications",
                href: "/notifications",
                icon: BellRing,
              },
              {
                title: "Explore Sellers",
                href: "/explore-sellers",
                icon: Store,
              },
            ],
          },
        ]
      : user.roleKey === "seller"
        ? [
            {
              label: "Overview",
              items: [
                {
                  title: "Dashboard",
                  href: "/dashboard",
                  icon: LayoutDashboard,
                },
                {
                  title: "Notifications",
                  href: "/notifications",
                  icon: BellRing,
                },
                {
                  title: "Explore Buyers",
                  href: "/explore-buyers",
                  icon: Users,
                },
                {
                  title: "Purchased Leads",
                  href: "/purchased-leads",
                  icon: ShoppingBag,
                },
              ],
            },
          ]
        : navigation;

  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Verifying secure session...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen flex bg-background"
      style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[var(--sidebar-width)] border-r border-border bg-card flex flex-col transition-[width,transform] duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/logo-mark.svg"
              alt="ChinaIndia Sourcing logo"
              width={36}
              height={36}
              priority
              className="size-9 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-none">
                China India Sourcing
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              title={sidebarWidth <= 220 ? "Expand sidebar" : "Shrink sidebar"}
              className="hidden size-8 p-0 lg:inline-flex"
              onClick={() =>
                setSidebarWidth((width) => (width <= 220 ? 320 : 220))
              }
            >
              {sidebarWidth <= 220 ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden size-8 p-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {roleNavigation.map((group) => (
            <div key={group.label}>
              <div className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {group.label}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                    >
                      <Icon className="size-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          {user?.roleKey === "buyer" || user?.roleKey === "seller" ? (
            <div>
              <div className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Account
              </div>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setWebsiteComingSoon(true);
                    setSidebarOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="size-4" />
                    Create Website
                  </span>
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    New
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <span className="flex items-center gap-2.5">
                    <Zap className="size-4" />
                    Email Automations
                  </span>
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    New
                  </span>
                </button>
                <nav className="mt-1 ml-5 space-y-0.5 border-l pl-2">
                  <Link
                    href="/automation/buyers"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/automation/buyers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                  >
                    <Users className="size-3.5" />
                    For Buyers
                  </Link>
                  <Link
                    href="/automation/sellers"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/automation/sellers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                  >
                    <Store className="size-3.5" />
                    For Sellers
                  </Link>
                  <Link
                    href="/automation/everyone"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/automation/everyone" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                  >
                    <Mail className="size-3.5" />
                    For Everyone
                  </Link>
                </nav>
                <Link
                  href="/billing"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${pathname === "/billing" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                >
                  <CreditCard className="size-4" />
                  Payment &amp; Billing
                </Link>
              </nav>
            </div>
          ) : null}
          {user?.roleKey === "super_admin" && (
            <div>
              <div className="px-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Admin Tools
              </div>
              <button
                type="button"
                onClick={() => setMailersOpen((open) => !open)}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${pathname.startsWith("/mailers") ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
              >
                <span className="flex items-center gap-2.5">
                  <Mail className="size-4" />
                  Mailers
                </span>
                <ChevronDown
                  className={`size-3.5 transition-transform ${mailersOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mailersOpen && (
                <nav className="mt-1 ml-5 space-y-0.5 border-l pl-2">
                  {[
                    {
                      title: "Templates",
                      href: "/mailers/templates",
                      icon: FileText,
                    },
                    {
                      title: "Create template",
                      href: "/mailers/templates/new",
                      icon: PenLine,
                    },
                    {
                      title: "Email Accounts",
                      href: "/mailers/email-accounts",
                      icon: AtSign,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                      >
                        <Icon className="size-3.5" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              )}
              <button
                type="button"
                onClick={() => setEmailsOpen((open) => !open)}
                className={`mt-1 flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${pathname.startsWith("/emails") ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
              >
                <span className="flex items-center gap-2.5">
                  <Inbox className="size-4" />
                  Emails
                </span>
                <ChevronDown
                  className={`size-3.5 transition-transform ${emailsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {emailsOpen && (
                <nav className="mt-1 ml-5 space-y-0.5 border-l pl-2">
                  {[
                    { title: "Sent", href: "/emails/sent", icon: Send },
                    {
                      title: "Unsent",
                      href: "/emails/unsent",
                      icon: CircleAlert,
                    },
                    { title: "Spam", href: "/emails/spam", icon: ShieldAlert },
                    { title: "Trash", href: "/emails/trash", icon: Trash2 },
                    {
                      title: "Automation Mails",
                      href: "/emails/automations",
                      icon: Mail,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                      >
                        <Icon className="size-3.5" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              )}
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setAutomationOpen((open) => !open)}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2.5">
                    <Zap className="size-4" />
                    Automation{" "}
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      New
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-3.5 transition-transform ${automationOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {automationOpen && (
                  <nav className="ml-5 space-y-0.5 border-l pl-2">
                    <Link
                      href="/automation/buyers"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/automation/buyers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                    >
                      <Users className="size-3.5" />
                      For Buyers
                    </Link>
                    <Link
                      href="/automation/sellers"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/automation/sellers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                    >
                      <Store className="size-3.5" />
                      For Sellers
                    </Link>
                    <Link
                      href="/automation/everyone"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/automation/everyone" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                    >
                      <Mail className="size-3.5" />
                      For Everyone
                    </Link>
                  </nav>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-background border border-border/70">
            <div className="flex flex-col">
              <span className="font-medium text-[11px]">Sourcing Platform</span>
              <span className="text-[10px] text-muted-foreground">
                Admin system online
              </span>
            </div>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
        </div>
        <button
          type="button"
          aria-label="Resize sidebar"
          title="Drag to resize sidebar"
          onMouseDown={() => setResizingSidebar(true)}
          className={`absolute right-[-4px] top-0 hidden h-full w-2 cursor-col-resize lg:block ${resizingSidebar ? "bg-blue-500/20" : "hover:bg-blue-500/15"}`}
        >
          <span className="absolute right-[3px] top-1/2 h-12 w-0.5 -translate-y-1/2 rounded-full bg-border" />
        </button>
      </aside>
      <div className="flex-1 flex flex-col lg:pl-[var(--sidebar-width)] min-w-0 transition-[padding] duration-200">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden size-9 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold">
                {user?.roleKey === "super_admin"
                  ? "Admin Console"
                  : `${user?.role || "Member"} Dashboard`}
              </p>
            </div>
          </div>
          {user.roleKey !== "super_admin" && (
            <Button
              size="sm"
              variant={user.plan === "premium" ? "default" : "outline"}
              onClick={() => setPlanOpen(true)}
              className={`ml-auto ${user.plan === "premium" ? "bg-amber-500 text-white hover:bg-amber-400" : "border-blue-300 text-blue-700 hover:bg-blue-50"}`}
            >
              <Crown className="size-4" />
              {user.plan === "premium" ? "Premium Plan" : "Free Plan"}
            </Button>
          )}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 pl-1.5 pr-2.5 h-9 rounded-full"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={user?.avatar || ""} alt="" />
                    <AvatarFallback className="text-xs">
                      {user?.name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold leading-none">
                      {user?.name || "Member"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {user?.role || "Member"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-1.5">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user?.name || "Member"}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.roleKey !== "super_admin" && (
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserRound className="mr-2 size-4" />
                    My profile
                  </DropdownMenuItem>
                )}
                {user?.roleKey === "super_admin" && (
                  <DropdownMenuItem disabled>
                    <Settings className="mr-2 size-4" />
                    Platform Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => logout.mutate()}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <Dialog open={websiteComingSoon} onOpenChange={setWebsiteComingSoon}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
              <Globe className="size-6" />
            </div>
            <DialogTitle>Website builder is coming soon</DialogTitle>
            <DialogDescription>
              Create Website is being prepared for buyer and seller accounts. It
              will be available here soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-500"
              onClick={() => setWebsiteComingSoon(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div
              className={`mb-2 flex size-12 items-center justify-center rounded-2xl ${user.plan === "premium" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}
            >
              <Crown className="size-6" />
            </div>
            <DialogTitle>
              {user.plan === "premium"
                ? "Premium Plan active"
                : "Upgrade to Premium Plan"}
            </DialogTitle>
            <DialogDescription>
              {user.plan === "premium"
                ? "Your marketplace verification payment is confirmed and your Premium Plan is active."
                : "Complete your existing SellersLogin Market payment receipt to activate Premium status."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-semibold">
              {user.plan === "premium"
                ? "Verified marketplace member"
                : "Secure Market payment"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {user.plan === "premium"
                ? "Your plan status is synced from the verified Market payment record."
                : "You will be redirected to the SellersLogin Market receipt and Razorpay checkout."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>
              Close
            </Button>
            {user.plan !== "premium" && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-500"
                disabled={startPayment.isPending}
                onClick={() => startPayment.mutate()}
              >
                {startPayment.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CreditCard className="size-4" />
                )}
                {startPayment.isPending
                  ? "Preparing..."
                  : "Continue to payment"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
