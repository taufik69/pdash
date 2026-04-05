import React, { useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Shield,
  Settings,
  Activity,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function NavUser({ user }) {
  const navigator = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigator("/login");
  };

  const { isMobile } = useSidebar();

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes dotPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%     { transform: scale(.6); opacity: .4; }
        }

        /* ── Trigger button ── */
        .nav-user-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid transparent;
          background: transparent;
          transition: background .18s, border-color .18s, box-shadow .18s;
          outline: none;
          text-align: left;
        }
        .nav-user-trigger:hover,
        .nav-user-trigger[data-state="open"] {
          background: rgba(218,119,8,.08);
          border-color: rgba(218,119,8,.2);
          box-shadow: 0 0 0 0px rgba(218,119,8,.15);
        }
        .nav-user-trigger[data-state="open"] {
          background: rgba(218,119,8,.12);
          border-color: rgba(218,119,8,.3);
        }

        /* ── Avatar ring ── */
        .nav-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .nav-avatar-ring {
          position: absolute;
          inset: -2px;
          border-radius: 10px;
          border: 1.5px solid rgba(218,119,8,.55);
          pointer-events: none;
          transition: border-color .18s;
        }
        .nav-user-trigger:hover .nav-avatar-ring,
        .nav-user-trigger[data-state="open"] .nav-avatar-ring {
          border-color: #da7708;
        }
        .nav-avatar-root {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          overflow: hidden;
          background: linear-gradient(135deg, #da7708, #92400e);
        }
        .nav-avatar-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          color: #0d1117;
          font-family: 'Sora', sans-serif;
          background: linear-gradient(135deg, #f59e0b, #da7708);
        }

        /* ── Online dot ── */
        .online-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid #111827;
          animation: dotPulse 2.5s ease-in-out infinite;
        }

        /* ── User info ── */
        .nav-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #e5e7eb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Plus Jakarta Sans', sans-serif;
          line-height: 1.2;
        }
        .nav-user-email {
          font-size: 10.5px;
          font-weight: 500;
          color: #4b5563;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin-top: 1px;
        }
        .nav-chevron {
          margin-left: auto;
          flex-shrink: 0;
          color: #4b5563;
          transition: transform .2s, color .18s;
        }
        .nav-user-trigger:hover .nav-chevron,
        .nav-user-trigger[data-state="open"] .nav-chevron {
          color: #da7708;
        }
        .nav-user-trigger[data-state="open"] .nav-chevron {
          transform: rotate(180deg);
        }

        /* ── Dropdown content ── */
        .nav-dropdown {
          background: #111827;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 13px;
          box-shadow: 0 20px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(218,119,8,.06);
          padding: 6px;
          min-width: 220px;
          animation: fadeInScale .16s cubic-bezier(.22,1,.36,1) both;
          overflow: hidden;
        }

        /* ── Dropdown header (user card) ── */
        .nav-dd-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 10px 12px;
          margin-bottom: 2px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .nav-dd-header-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #da7708);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          color: #0d1117;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(218,119,8,.3);
          font-family: 'Sora', sans-serif;
        }
        .nav-dd-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: rgba(218,119,8,.8);
          background: rgba(218,119,8,.1);
          border: 1px solid rgba(218,119,8,.2);
          border-radius: 20px;
          padding: 2px 7px;
          margin-top: 3px;
        }

        /* ── Menu items ── */
        .nav-dd-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #9ca3af;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background .15s, color .15s, border-color .15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          width: 100%;
          background: none;
          text-align: left;
        }
        .nav-dd-item:hover {
          background: rgba(255,255,255,.04);
          color: #e5e7eb;
          border-color: rgba(255,255,255,.06);
        }
        .nav-dd-item.danger:hover {
          background: rgba(239,68,68,.07);
          color: #f87171;
          border-color: rgba(239,68,68,.15);
        }
        .nav-dd-item .item-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,.04);
          flex-shrink: 0;
          transition: background .15s;
        }
        .nav-dd-item:hover .item-icon {
          background: rgba(218,119,8,.12);
          color: #da7708;
        }
        .nav-dd-item.danger:hover .item-icon {
          background: rgba(239,68,68,.1);
          color: #f87171;
        }

        .nav-dd-separator {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
          margin: 5px 4px;
        }

        /* ── Section label ── */
        .nav-dd-section-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #374151;
          padding: 6px 10px 4px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="nav-user-trigger"
                data-state={open ? "open" : "closed"}
              >
                {/* Avatar */}
                <div className="nav-avatar-wrap">
                  <div className="nav-avatar-root">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="nav-avatar-fallback">
                        {user?.name?.charAt(0) ?? "A"}
                      </div>
                    )}
                  </div>
                  <div className="nav-avatar-ring" />
                  <div className="online-dot" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nav-user-name">{user?.name ?? "Admin"}</div>
                  <div className="nav-user-email">{user?.email ?? ""}</div>
                </div>

                <ChevronsUpDown size={14} className="nav-chevron" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
              asChild
            >
              <div className="nav-dropdown">
                {/* User identity card */}
                <div className="nav-dd-header">
                  <div className="nav-dd-header-avatar">
                    {user?.name?.charAt(0) ?? "A"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#f1f5f9",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.name ?? "Admin"}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "#4b5563",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.email ?? ""}
                    </div>
                    <div className="nav-dd-badge">
                      <Shield size={7} /> Super Admin
                    </div>
                  </div>
                </div>

                {/* Account section */}
                <div className="nav-dd-section-label">Account</div>

                <button className="nav-dd-item">
                  <div className="item-icon">
                    <BadgeCheck size={13} />
                  </div>
                  Profile & Verification
                </button>

                <button className="nav-dd-item">
                  <div className="item-icon">
                    <Settings size={13} />
                  </div>
                  Settings
                </button>

                <button className="nav-dd-item">
                  <div className="item-icon">
                    <Bell size={13} />
                  </div>
                  Notifications
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: ".05em",
                      background: "rgba(218,119,8,.15)",
                      color: "#da7708",
                      border: "1px solid rgba(218,119,8,.25)",
                      borderRadius: 12,
                      padding: "1px 6px",
                    }}
                  >
                    3
                  </span>
                </button>

                <div className="nav-dd-separator" />

                {/* Danger zone */}
                <div className="nav-dd-section-label">Session</div>

                <button className="nav-dd-item danger" onClick={handleLogout}>
                  <div className="item-icon">
                    <LogOut size={13} />
                  </div>
                  Sign Out
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
