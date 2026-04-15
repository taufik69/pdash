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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  :root {
    --sb-bg:       var(--background);
    --sb-foreground: var(--foreground);
    --sb-border:   var(--border);
    --sb-muted:    var(--muted-foreground);
    --sb-accent:   var(--primary);
    --sb-font:     'Inter', sans-serif;
  }

  /* ── Sidebar shell ─────────────────────────────────────── */
  [data-sidebar="sidebar"] {
    background: var(--sb-bg) !important;
    border-right: 1px solid var(--sb-border) !important;
    font-family: var(--sb-font) !important;
  }

  /* ── Logo header block ─────────────────────────────────── */
  .sb-logo-block {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--sb-border);
  }

  .sb-logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sb-logo-icon svg {
    color: var(--primary-foreground);
    width: 18px;
    height: 18px;
  }

  .sb-logo-text {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
  }

  .sb-logo-name {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--foreground);
    white-space: nowrap;
  }

  .sb-logo-sub {
    font-size: 14px;
    font-weight: 500;
    color: var(--sb-muted);
  }

  /* Hide logo text in collapsed (icon-only) mode */
  [data-collapsible="icon"] .sb-logo-text {
    display: none;
  }

  /* ── Content ───────────────────────────────────────────── */
  [data-sidebar="content"] {
    padding: 12px 0 !important;
  }

  /* ── Footer ────────────────────────────────────────────── */
  [data-sidebar="footer"] {
    padding: 12px 10px !important;
    border-top: 1px solid var(--sb-border) !important;
  }

  /* ── Group label ───────────────────────────────────────── */
  [data-sidebar="group-label"] {
    font-size: 14px !important;
    font-weight: 600 !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
    color: var(--sb-muted) !important;
    padding: 20px 20px 8px !important;
  }

  /* ── Menu buttons ──────────────────────────────────────── */
  [data-sidebar="menu-button"] {
    font-size: 16.5px !important;
    font-weight: 500 !important;
    color: var(--sb-muted) !important;
    border-radius: 6px !important;
    padding: 10px 14px !important;
    margin: 2px 10px !important;
    width: calc(100% - 20px) !important;
    transition: all 0.2s !important;
  }

  [data-sidebar="menu-button"]:hover {
    color: var(--foreground) !important;
    background: var(--secondary) !important;
  }

  [data-sidebar="menu-button"][data-active="true"] {
    color: var(--primary-foreground) !important;
    background: var(--primary) !important;
    font-weight: 600 !important;
  }

  [data-sidebar="menu-button"] svg {
    width: 16px !important;
    height: 16px !important;
    color: inherit !important;
  }

  /* ── Sub menu ──────────────────────────────────────────── */
  [data-sidebar="menu-sub"] {
    border-left: 1px solid var(--sb-border) !important;
    margin: 4px 0 4px 28px !important;
    padding: 2px 0 !important;
    gap: 2px !important;
  }

  [data-sidebar="menu-sub-button"] {
    font-size: 16px !important;
    font-weight: 500 !important;
    color: var(--sb-muted) !important;
    padding: 8px 12px !important;
    border-radius: 4px !important;
    margin: 0 8px !important;
    transition: all 0.2s !important;
  }

  [data-sidebar="menu-sub-button"]:hover {
    color: var(--foreground) !important;
    background: var(--secondary) !important;
  }

  [data-sidebar="menu-sub-button"][data-active="true"] {
    color: var(--foreground) !important;
    background: var(--secondary) !important;
    font-weight: 600 !important;
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
