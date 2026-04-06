import React from "react";
import { Home, LayoutGrid, Box, PenLine, Zap, Star, Tag, Image, ShieldAlert } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const storedAdmin = localStorage.getItem("admin");
const admin = storedAdmin ? JSON.parse(storedAdmin) : null;

const data = {
  user: {
    name: admin?.name,
    email: admin?.email,
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
      items: [{ title: "Home", url: "/home" }],
    },
    {
      title: "Category Management",
      url: "#",
      icon: LayoutGrid,
      isActive: true,
      items: [
        { title: "Add Category", url: "/add-category" },
        { title: "Category List", url: "/category-list" },
        { title: "Add Sub-Category", url: "/add-subcategory" },
        { title: "Sub-Category List", url: "/subcategory-list" },
      ],
    },
    {
      title: "Brand Management",
      url: "#",
      icon: Star,
      isActive: true,
      items: [
        { title: "Add Brand", url: "/add-brand" },
        { title: "Brand List", url: "/brand-list" },
      ],
    },
    {
      title: "Product Management",
      url: "#",
      icon: Box,
      isActive: true,
      items: [
        { title: "Add Product", url: "/add-product" },
        { title: "Product List", url: "/product-list" },
      ],
    },
    {
      title: "Banner Management",
      url: "#",
      icon: Image,
      isActive: true,
      items: [
        { title: "Add Banner", url: "/add-banner" },
        { title: "Banner List", url: "/banner-list" },
      ],
    },
    {
      title: "Order Management",
      url: "#",
      icon: PenLine,
      isActive: true,
      items: [
        { title: "All Orders", url: "/order-list" },
        { title: "Pending Orders", url: "/order-list?status=pending" },
        { title: "Processing Orders", url: "/order-list?status=processing" },
        { title: "Confirmed Orders", url: "/order-list?status=confirmed" },
        { title: "Delivered Orders", url: "/order-list?status=delivered" },
        { title: "Cancelled Orders", url: "/order-list?status=cancelled" },
        // { title: "Returned Orders", url: "/order-list?status=returned" },
        // { title: "Rejected Orders", url: "/order-list?status=rejected" },
      ],
    },
    {
      title: "Tools & Security",
      url: "#",
      icon: ShieldAlert,
      isActive: true,
      items: [
        { title: "Fraud Checker", url: "/fraud-checker" },
        { title: "IP Block Management", url: "/ip-block" },
      ],
    },
  ],
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&display=swap');

  :root {
    --s-bg:       #07101d;
    --s-surface:  #0c1829;
    --s-border:   #172335;
    --s-line:     #1f3249;
    --s-amber:    #da7708;
    --s-amb10:    #da77081a;
    --s-amb20:    #da770833;
    --s-amb40:    #da770866;
    --s-ink:      #ccdaec;
    --s-dim:      #607d99;
    --s-muted:    #2e4560;
    --s-font:     'Geist Mono', 'Fira Code', ui-monospace, monospace;
  }

  /* ── Sidebar shell ─────────────────────────────────────── */
  [data-sidebar="sidebar"] {
    background: var(--s-bg) !important;
    border-right: 1px solid var(--s-border) !important;
    font-family: var(--s-font) !important;
  }

  /* Desktop only: subtle mesh + right glow */
  @media (min-width: 768px) {
    [data-sidebar="sidebar"] {
      position: relative !important;
      overflow: hidden !important;
    }

    [data-sidebar="sidebar"]::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle at 1px 1px, #172335 1px, transparent 0);
      background-size: 22px 22px;
      opacity: 0.55;
      pointer-events: none;
      z-index: 0;
    }

    [data-sidebar="sidebar"] > * {
      position: relative;
      z-index: 1;
    }
  }

  /* ── Logo header block ─────────────────────────────────── */
  .sb-logo-block {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 18px 16px 16px;
    border-bottom: 1px solid var(--s-border);
  }

  .sb-logo-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--s-amber);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 16px var(--s-amb40);
  }

  .sb-logo-icon svg {
    color: #07101d;
    width: 16px;
    height: 16px;
  }

  .sb-logo-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .sb-logo-name {
    font-family: var(--s-font);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--s-ink);
    white-space: nowrap;
  }

  .sb-logo-sub {
    font-family: var(--s-font);
    font-size: 9px;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--s-amber);
  }

  /* Hide logo text in collapsed (icon-only) mode */
  [data-collapsible="icon"] .sb-logo-text {
    display: none;
  }

  [data-collapsible="icon"] .sb-logo-block {
    justify-content: center;
    padding: 16px 0;
  }

  /* ── Header ────────────────────────────────────────────── */
  [data-sidebar="header"] {
    padding: 0 !important;
    background: transparent !important;
  }

  /* ── Content ───────────────────────────────────────────── */
  [data-sidebar="content"] {
    padding: 6px 0 !important;
    gap: 0 !important;
  }

  [data-sidebar="content"]::-webkit-scrollbar { width: 2px; }
  [data-sidebar="content"]::-webkit-scrollbar-track { background: transparent; }
  [data-sidebar="content"]::-webkit-scrollbar-thumb {
    background: var(--s-line);
    border-radius: 1px;
  }

  /* ── Footer ────────────────────────────────────────────── */
  [data-sidebar="footer"] {
    padding: 10px 8px !important;
    border-top: 1px solid var(--s-border) !important;
    background: transparent !important;
  }

  /* ── Rail ──────────────────────────────────────────────── */
  [data-sidebar="rail"] {
    border-right: none !important;
    width: 3px !important;
    background: transparent !important;
    transition: background 0.2s !important;
    cursor: col-resize !important;
  }

  [data-sidebar="rail"]:hover {
    background: var(--s-amb20) !important;
  }

  /* ── Tooltip (collapsed icon mode) ────────────────────── */
  [data-sidebar="tooltip-content"] {
    background: var(--s-surface) !important;
    border: 1px solid var(--s-line) !important;
    border-left: 2px solid var(--s-amber) !important;
    color: var(--s-ink) !important;
    font-family: var(--s-font) !important;
    font-size: 10px !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    border-radius: 4px !important;
    padding: 5px 12px !important;
    box-shadow: 0 8px 24px #00000080 !important;
  }

  /* ── Group label ───────────────────────────────────────── */
  [data-sidebar="group-label"] {
    font-family: var(--s-font) !important;
    font-size: 8.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.28em !important;
    text-transform: uppercase !important;
    color: var(--s-muted) !important;
    padding: 18px 16px 7px !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }

  [data-sidebar="group-label"]::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--s-line), transparent);
  }

  /* ── Menu buttons ──────────────────────────────────────── */
  [data-sidebar="menu-button"] {
    font-family: var(--s-font) !important;
    font-size: 11.5px !important;
    font-weight: 400 !important;
    letter-spacing: 0.04em !important;
    color: var(--s-dim) !important;
    border-radius: 5px !important;
    padding: 9px 12px !important;
    margin: 1px 8px !important;
    width: calc(100% - 16px) !important;
    border: 1px solid transparent !important;
    background: transparent !important;
    transition: color 0.13s, background 0.13s, border-color 0.13s !important;
    position: relative !important;
  }

  /* Left accent bar */
  [data-sidebar="menu-button"]::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 2px;
    background: var(--s-amber);
    border-radius: 0 1px 1px 0;
    transform: scaleY(0);
    transform-origin: center;
    transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  [data-sidebar="menu-button"]:hover {
    color: var(--s-ink) !important;
    background: var(--s-surface) !important;
    border-color: var(--s-border) !important;
  }

  [data-sidebar="menu-button"]:hover::before,
  [data-sidebar="menu-button"][data-state="open"]::before,
  [data-sidebar="menu-button"][data-active="true"]::before {
    transform: scaleY(1);
  }

  [data-sidebar="menu-button"][data-state="open"],
  [data-sidebar="menu-button"][data-active="true"] {
    color: var(--s-ink) !important;
    background: var(--s-surface) !important;
    border-color: var(--s-border) !important;
  }

  /* Icons */
  [data-sidebar="menu-button"] svg {
    width: 14px !important;
    height: 14px !important;
    color: var(--s-muted) !important;
    flex-shrink: 0 !important;
    transition: color 0.13s !important;
  }

  [data-sidebar="menu-button"]:hover svg:first-child,
  [data-sidebar="menu-button"][data-state="open"] svg:first-child,
  [data-sidebar="menu-button"][data-active="true"] svg:first-child {
    color: var(--s-amber) !important;
  }

  /* Chevron */
  [data-sidebar="menu-button"] .lucide-chevron-right {
    margin-left: auto !important;
    color: var(--s-muted) !important;
    transition: transform 0.2s ease, color 0.13s !important;
  }

  [data-sidebar="menu-button"][data-state="open"] .lucide-chevron-right {
    transform: rotate(90deg) !important;
    color: var(--s-amber) !important;
  }

  /* ── Sub menu ──────────────────────────────────────────── */
  [data-sidebar="menu-sub"] {
    border-left: 1px solid var(--s-line) !important;
    margin: 2px 0 4px 26px !important;
    padding: 2px 0 !important;
    gap: 1px !important;
  }

  [data-sidebar="menu-sub-button"] {
    font-family: var(--s-font) !important;
    font-size: 10.5px !important;
    font-weight: 300 !important;
    letter-spacing: 0.06em !important;
    color: var(--s-muted) !important;
    padding: 7px 12px !important;
    border-radius: 3px !important;
    margin: 0 4px !important;
    transition: color 0.11s, background 0.11s !important;
    position: relative !important;
  }

  [data-sidebar="menu-sub-button"]::before {
    content: '';
    position: absolute;
    left: -9px; top: 50%;
    width: 5px; height: 1px;
    background: var(--s-line);
    transform: translateY(-50%);
    transition: background 0.11s, width 0.11s, left 0.11s;
  }

  [data-sidebar="menu-sub-button"]:hover {
    color: var(--s-ink) !important;
    background: var(--s-amb10) !important;
  }

  [data-sidebar="menu-sub-button"]:hover::before,
  [data-sidebar="menu-sub-button"][data-active="true"]::before {
    background: var(--s-amber);
    width: 8px;
    left: -12px;
  }

  [data-sidebar="menu-sub-button"][data-active="true"] {
    color: var(--s-amber) !important;
  }

  /* ── Menu action ───────────────────────────────────────── */
  [data-sidebar="menu-action"] {
    width: 22px !important;
    height: 22px !important;
    border-radius: 3px !important;
    color: var(--s-muted) !important;
    transition: background 0.12s, color 0.12s !important;
  }

  [data-sidebar="menu-action"]:hover {
    background: var(--s-surface) !important;
    color: var(--s-amber) !important;
  }
`;

export function AppSidebar(props) {
  return (
    <>
      <style>{styles}</style>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          {/* Logo / Brand block */}
          <div className="sb-logo-block">
            <div className="sb-logo-icon">
              <Zap />
            </div>
            <div className="sb-logo-text">
              <span className="sb-logo-name">TotalBazar.com</span>
              <span className="sb-logo-sub">Admin Panel</span>
            </div>
          </div>

          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>

        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  );
}
