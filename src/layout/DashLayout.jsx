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
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

  .dashboard-root {
    display: flex;
    height: 100vh;
    width: 100%;
    background: #ffffff;
    font-family: 'DM Mono', 'Fira Mono', 'Courier New', monospace;
    overflow: hidden;
  }

  /* ── Header ───────────────────────────────────────────── */
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    height: 52px;
    flex-shrink: 0;
    padding: 0 20px;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
    background: #ffffff;
  }

  /* thin amber rule at very bottom of header */
  .dashboard-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(to right, #da770830, transparent);
    pointer-events: none;
  }

  /* Breadcrumb / title slot (optional children) */
  .header-breadcrumb {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #6b7280;
    letter-spacing: 0.06em;
  }

  .header-breadcrumb .sep {
    color: #374151;
  }

  .header-breadcrumb .active {
    color: #da7708;
  }

  /* Sidebar trigger override */
  .dashboard-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid #374151;
    color: #9ca3af;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.13s ease;
  }

  .dashboard-trigger:hover {
    background: #1f2937;
    border-color: #da7708;
    color: #da7708;
  }

  .dashboard-trigger svg {
    width: 14px;
    height: 14px;
  }

  /* ── Inset / content area ─────────────────────────────── */
  .dashboard-inset {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    background: #ffffff;
  }

  /* ── Main scroll area ─────────────────────────────────── */
  .dashboard-main {
    flex: 1;
    overflow: auto;
    padding: 24px 28px;
    background: #ffffff;
    color: #111827;
  }

  /* custom scrollbar */
  .dashboard-main::-webkit-scrollbar {
    width: 5px;
  }
  .dashboard-main::-webkit-scrollbar-track {
    background: #111827;
  }
  .dashboard-main::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 3px;
  }
  .dashboard-main::-webkit-scrollbar-thumb:hover {
    background: #da770860;
  }

  /* ── Theme toggle ─────────────────────────────────────── */
  .theme-toggle-wrapper {
    position: fixed;
    top: 12px;
    right: 16px;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 5px;
    background: #1f2937;
    border: 1px solid #374151;
    transition: all 0.13s ease;
    cursor: pointer;
  }

  .theme-toggle-wrapper:hover {
    border-color: #da7708;
    box-shadow: 0 0 8px #da770830;
  }

  .theme-toggle-wrapper svg {
    width: 14px;
    height: 14px;
    color: #9ca3af;
    transition: color 0.13s ease;
  }

  .theme-toggle-wrapper:hover svg {
    color: #da7708;
  }

  /* ── Sidebar border accent ────────────────────────────── */
  [data-sidebar="sidebar"] {
    border-right: 1px solid #e5e7eb !important;
    box-shadow: 2px 0 12px rgba(0,0,0,0.05) !important;
    background: #ffffff !important;
    color: #111827 !important;
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SidebarTrigger className="dashboard-trigger" />

                {/* Breadcrumb slot — customize per route if needed */}
                <div className="header-breadcrumb">
                  <span>Platform</span>
                  <span className="sep">/</span>
                  <span className="active">Dashboard</span>
                </div>
              </div>

              {/* Visit Site Button */}
              <div>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#da7708',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  সাইট ভিজিট
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
