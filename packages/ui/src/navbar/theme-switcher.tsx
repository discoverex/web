"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  const currentTheme = (theme === "system" ? resolvedTheme : theme) || "dark";

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="btn btn-ghost btn-circle btn-sm shadow-inner bg-base-200/50"
      aria-label="Toggle Theme"
    >
      {currentTheme === "dark" ? (
        <Moon size={18} className="text-amber-400" />
      ) : (
        <Sun size={18} className="text-orange-500" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
