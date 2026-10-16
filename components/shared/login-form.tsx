"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Store, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginRole = "buyer" | "seller" | "admin";

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const [role, setRole] = React.useState<LoginRole>(admin ? "admin" : "buyer");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const login = useMutation({
    mutationFn: async () => { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, expectedRole: role }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Invalid credentials"); return body; },
    onSuccess: (body) => { toast.success(`Welcome back, ${body.data?.name || "Member"}!`); router.push("/dashboard"); router.refresh(); },
    onError: (error: Error) => toast.error(error.message),
  });

  return <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12"><div className="w-full max-w-md space-y-6">
    <div className="flex flex-col items-center space-y-2 text-center"><Image src="/logo-mark.svg" alt="China India Sourcing logo" width={56} height={56} priority className="size-14 drop-shadow-sm"/><h1 className="text-2xl font-extrabold tracking-tight">China India Sourcing</h1></div>
    <Card className="border-border/80 shadow-lg"><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-lg">{admin ? "Admin sign in" : `${role === "buyer" ? "Buyer" : "Seller"} sign in`}</CardTitle><Badge variant="outline" className="gap-1 text-[10px]"><ShieldCheck className="size-3"/>Secure</Badge></div></CardHeader><CardContent>
      {!admin && <div className="relative mb-5 grid grid-cols-2 rounded-xl bg-muted p-1"><span aria-hidden className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-background shadow-sm transition-transform duration-300 ${role === "seller" ? "translate-x-full" : "translate-x-0"}`}/><button type="button" onClick={()=>setRole("buyer")} className={`relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${role === "buyer" ? "text-blue-600" : "text-muted-foreground"}`}><Users className="size-4"/>Buyer</button><button type="button" onClick={()=>setRole("seller")} className={`relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${role === "seller" ? "text-blue-600" : "text-muted-foreground"}`}><Store className="size-4"/>Seller</button></div>}
      <form onSubmit={event=>{event.preventDefault();login.mutate();}} className="space-y-3"><div className="space-y-1.5"><Label className="text-xs">Email Address</Label><div className="relative"><Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className="h-9 pl-9 text-xs"/></div></div><div className="space-y-1.5"><Label className="text-xs">Password</Label><div className="relative"><Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input type={showPassword?"text":"password"} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="h-9 pl-9 pr-10 text-xs"/><button type="button" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(value=>!value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button></div></div><Button type="submit" className="mt-2 h-9 w-full gap-1.5 text-xs font-semibold" disabled={login.isPending}>{login.isPending?"Authenticating...":`Sign In as ${admin?"Admin":role === "buyer"?"Buyer":"Seller"}`}<ArrowRight className="size-3.5"/></Button></form>
      {!admin && <p className="mt-5 border-t pt-4 text-center text-sm text-muted-foreground">Want to become our member? <a href="https://chinaindiasourcing.com" className="font-semibold text-blue-600 hover:underline">Click here</a></p>}
    </CardContent></Card>
  </div></div>;
}
