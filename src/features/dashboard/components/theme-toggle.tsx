"use client";

import { Moon, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "payengine-theme";

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");

    root.classList.toggle("dark", nextIsDark);
    localStorage.setItem(STORAGE_KEY, nextIsDark ? "dark" : "light");
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      <Moon className="dark:hidden" />
      <SunMedium className="hidden dark:block" />
    </Button>
  );
}
