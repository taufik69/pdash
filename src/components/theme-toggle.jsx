import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/*
  Palette (matches full design system):
    Amber    → #da7708
    Dark BG  → #111827
    Surface  → #1f2937
    Muted    → #374151
    Text     → #f9fafb
    Subtext  → #9ca3af
*/

const styles = `
  @keyframes tt-spin-in {
    from { opacity: 0; transform: rotate(-90deg) scale(0.6); }
    to   { opacity: 1; transform: rotate(0deg) scale(1); }
  }

  @keyframes tt-pulse-ring {
    0%   { box-shadow: 0 0 0 0 #da770840; }
    70%  { box-shadow: 0 0 0 6px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }

  .theme-toggle-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 5px;
    background: #1f2937;
    border: 1px solid #374151;
    cursor: pointer;
    padding: 0;
    transition:
      border-color 0.15s ease,
      background 0.15s ease,
      box-shadow 0.15s ease;
    outline: none;
    font-family: inherit;
  }

  .theme-toggle-btn:hover {
    background: #263040;
    border-color: #da7708;
    box-shadow: 0 0 10px #da770830;
  }

  .theme-toggle-btn:active {
    animation: tt-pulse-ring 0.4s ease forwards;
    transform: scale(0.94);
  }

  /* Icon wrapper handles the spin transition */
  .tt-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: tt-spin-in 0.22s ease forwards;
  }

  .tt-icon svg {
    width: 14px;
    height: 14px;
    transition: color 0.15s ease;
  }

  /* Sun → amber glow */
  .tt-icon.sun svg {
    color: #da7708;
    filter: drop-shadow(0 0 4px #da770880);
  }

  /* Moon → muted blue-gray */
  .tt-icon.moon svg {
    color: #9ca3af;
  }

  .theme-toggle-btn:hover .tt-icon.sun svg {
    color: #f59e0b;
    filter: drop-shadow(0 0 6px #f59e0b80);
  }

  .theme-toggle-btn:hover .tt-icon.moon svg {
    color: #da7708;
  }
`;

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  // Key forces icon remount → re-triggers spin animation on each toggle
  const [iconKey, setIconKey] = useState(0);

  useEffect(() => {
    const storedTheme = localStorage.getItem("dashTheme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIconKey((k) => k + 1);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dashTheme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dashTheme", "dark");
      setIsDark(true);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
      >
        <span key={iconKey} className={`tt-icon ${isDark ? "sun" : "moon"}`}>
          {isDark ? <Sun /> : <Moon />}
        </span>
      </button>
    </>
  );
}
