"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-10 rounded-xl cursor-pointer" aria-label="Toggle theme">
        <Sun className="size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 rounded-xl cursor-pointer hover:bg-muted/80"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="size-5 text-amber-400 transition-transform" />
      ) : (
        <Moon className="size-5 text-muted-foreground transition-transform" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
