import React from "react";
import { Outlet } from "react-router-dom";

import ThemeToggle from "@/components/theme-toggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

/*
  Palette (matches NavMain / NavProjects / TeamSwitcher):
    Amber    → #da7708
    Dark BG  → #111827
    Surface  → #1f2937
    Muted    → #374151
    Text     → #f9fafb
    Subtext  → #9ca3af
*/

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  .dashboard-root {
    display: flex;
    height: 100vh;
    width: 100%;
    background: var(--background);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
  }

  /* ── Header ───────────────────────────────────────────── */
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    height: 56px;
    flex-shrink: 0;
    padding: 0 24px;
    border-bottom: 1px solid var(--border);
    position: relative;
    background: var(--background);
  }

  /* Breadcrumb / title slot (optional children) */
  .header-breadcrumb {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--muted-foreground);
    letter-spacing: -0.01em;
  }

  .header-breadcrumb .sep {
    color: var(--border);
  }

  .header-breadcrumb .active {
    color: var(--foreground);
    font-weight: 600;
  }

  /* Sidebar trigger override */
  .dashboard-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted-foreground);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .dashboard-trigger:hover {
    background: var(--secondary);
    color: var(--foreground);
    border-color: var(--foreground);
  }

  .dashboard-trigger svg {
    width: 16px;
    height: 16px;
  }

  /* ── Inset / content area ─────────────────────────────── */
  .dashboard-inset {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    background: var(--background);
  }

  /* ── Main scroll area ─────────────────────────────────── */
  .dashboard-main {
    flex: 1;
    overflow: auto;
    padding: 32px;
    background: var(--background);
    color: var(--foreground);
  }

  /* custom scrollbar */
  .dashboard-main::-webkit-scrollbar {
    width: 6px;
  }
  .dashboard-main::-webkit-scrollbar-track {
    background: transparent;
  }
  .dashboard-main::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
  }
  .dashboard-main::-webkit-scrollbar-thumb:hover {
    background: var(--muted-foreground);
  }

  /* ── Sidebar border accent ────────────────────────────── */
  [data-sidebar="sidebar"] {
    border-right: 1px solid var(--border) !important;
    background: var(--background) !important;
    color: var(--foreground) !important;
  }
`;

function DashboardLayout() {
  return (
    <>
      <style>{styles}</style>
      <SidebarProvider>
        <div className="dashboard-root">
          {/* Sidebar */}
          <AppSidebar />

          {/* Content Area */}
          <SidebarInset className="dashboard-inset">
            {/* Header */}
            <header className="dashboard-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <SidebarTrigger className="dashboard-trigger" />

                {/* Breadcrumb slot — customize per route if needed */}
                <div className="header-breadcrumb">
                  <span>Platform</span>
                  <span className="sep">/</span>
                  <span className="active">Dashboard</span>
                </div>
              </div>

              {/* Visit Site Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ThemeToggle />
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                    border: '1px solid var(--primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Visit Site
                </a>
              </div>
            </header>

            {/* Main content */}
            <main className="dashboard-main">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}

export default DashboardLayout;
