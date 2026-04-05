import React, { useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

/*
  Palette (matches NavMain / NavProjects):
    Amber    → #da7708
    Dark BG  → #111827
    Surface  → #1f2937
    Muted    → #374151
    Text     → #f9fafb
    Subtext  → #9ca3af
*/

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

  .team-switcher-menu {
    font-family: 'DM Mono', 'Fira Mono', 'Courier New', monospace;
    padding: 0 8px 6px;
  }

  /* Trigger button */
  .team-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 7px 10px;
    border-radius: 5px;
    background: #1f2937;
    border: 1px solid #374151;
    cursor: pointer;
    transition: all 0.14s ease;
    font-family: inherit;
    position: relative;
    overflow: hidden;
  }

  .team-trigger::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #da770808 0%, transparent 60%);
    pointer-events: none;
  }

  .team-trigger:hover,
  .team-trigger[data-state="open"] {
    background: #263040;
    border-color: #da770860;
    box-shadow: 0 0 0 1px #da770820;
  }

  .team-trigger:hover .team-chevron,
  .team-trigger[data-state="open"] .team-chevron {
    color: #da7708;
  }

  /* Logo badge */
  .team-logo-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 5px;
    background: linear-gradient(135deg, #da7708, #b86006);
    box-shadow: 0 2px 8px #da770840;
    flex-shrink: 0;
    position: relative;
  }

  .team-logo-badge::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 5px;
    background: linear-gradient(135deg, #ffffff18 0%, transparent 50%);
    pointer-events: none;
  }

  .team-logo-badge svg {
    width: 15px;
    height: 15px;
    color: #111827;
  }

  /* Name + plan text */
  .team-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    text-align: left;
    min-width: 0;
  }

  .team-name {
    font-size: 13px;
    font-weight: 500;
    color: #f9fafb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.01em;
  }

  .team-plan {
    font-size: 10px;
    color: #da7708;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .team-chevron {
    width: 14px;
    height: 14px;
    color: #6b7280;
    flex-shrink: 0;
    transition: color 0.14s ease;
    margin-left: auto;
  }

  /* Dropdown panel */
  .team-dropdown {
    background: #1a2332 !important;
    border: 1px solid #374151 !important;
    border-radius: 7px !important;
    padding: 5px !important;
    box-shadow: 0 12px 32px #00000070, 0 0 0 1px #da770812 !important;
    font-family: 'DM Mono', 'Fira Mono', 'Courier New', monospace;
    min-width: 200px !important;
  }

  /* Dropdown label */
  .team-dropdown-label {
    font-size: 9px !important;
    font-weight: 700 !important;
    letter-spacing: 0.18em !important;
    text-transform: uppercase !important;
    color: #da7708 !important;
    padding: 6px 8px 5px !important;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .team-dropdown-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #da770840, transparent);
  }

  /* Dropdown items */
  .team-dropdown-item {
    display: flex !important;
    align-items: center !important;
    gap: 9px !important;
    padding: 7px 8px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    font-family: inherit !important;
    color: #d1d5db !important;
    cursor: pointer !important;
    transition: background 0.1s ease, color 0.1s ease !important;
    letter-spacing: 0.01em !important;
  }

  .team-dropdown-item:hover {
    background: #111827 !important;
    color: #f9fafb !important;
  }

  .team-dropdown-item:hover .team-item-logo {
    border-color: #da7708 !important;
    background: #da770818 !important;
  }

  .team-dropdown-item:hover .team-item-logo svg {
    color: #da7708 !important;
  }

  .team-dropdown-item[data-active="true"] {
    background: #da770812 !important;
    color: #f9fafb !important;
  }

  .team-dropdown-item[data-active="true"] .team-item-logo {
    border-color: #da7708 !important;
    background: linear-gradient(135deg, #da7708, #b86006) !important;
  }

  .team-dropdown-item[data-active="true"] .team-item-logo svg {
    color: #111827 !important;
  }

  /* Item logo */
  .team-item-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 1px solid #374151;
    background: #1f2937;
    flex-shrink: 0;
    transition: border-color 0.1s ease, background 0.1s ease;
  }

  .team-item-logo svg {
    width: 12px;
    height: 12px;
    color: #9ca3af;
    transition: color 0.1s ease;
  }

  /* Shortcut badge */
  .team-shortcut {
    margin-left: auto !important;
    font-size: 10px !important;
    color: #6b7280 !important;
    background: #374151 !important;
    padding: 1px 5px !important;
    border-radius: 3px !important;
    letter-spacing: 0.02em !important;
  }

  .team-dropdown-item:hover .team-shortcut {
    color: #da7708 !important;
    background: #da770818 !important;
  }

  /* Separator */
  .team-sep {
    height: 1px !important;
    background: #374151 !important;
    margin: 4px 0 !important;
  }

  /* Add team row */
  .team-add-item {
    display: flex !important;
    align-items: center !important;
    gap: 9px !important;
    padding: 7px 8px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    font-family: inherit !important;
    color: #6b7280 !important;
    cursor: pointer !important;
    letter-spacing: 0.01em !important;
    transition: background 0.1s ease, color 0.1s ease !important;
  }

  .team-add-item:hover {
    background: #111827 !important;
    color: #da7708 !important;
  }

  .team-add-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 1px dashed #374151;
    background: transparent;
    flex-shrink: 0;
    transition: border-color 0.1s ease;
  }

  .team-add-item:hover .team-add-icon {
    border-color: #da7708;
  }

  .team-add-icon svg {
    width: 11px;
    height: 11px;
    color: #6b7280;
    transition: color 0.1s ease;
  }

  .team-add-item:hover .team-add-icon svg {
    color: #da7708;
  }
`;

export function TeamSwitcher({ teams }) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = useState(teams?.[0]);

  if (!activeTeam) return null;

  return (
    <>
      <style>{styles}</style>
      <SidebarMenu className="team-switcher-menu">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="team-trigger">
                <div className="team-logo-badge">
                  <activeTeam.logo />
                </div>

                <div className="team-info">
                  <span className="team-name">{activeTeam.name}</span>
                  <span className="team-plan">{activeTeam.plan}</span>
                </div>

                <ChevronsUpDown className="team-chevron" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="team-dropdown"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={6}
            >
              <DropdownMenuLabel className="team-dropdown-label">
                Teams
              </DropdownMenuLabel>

              {teams?.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="team-dropdown-item"
                  data-active={activeTeam.name === team.name}
                >
                  <div className="team-item-logo">
                    <team.logo />
                  </div>

                  <span>{team.name}</span>

                  <DropdownMenuShortcut className="team-shortcut">
                    ⌘{index + 1}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator className="team-sep" />

              <DropdownMenuItem className="team-add-item">
                <div className="team-add-icon">
                  <Plus />
                </div>
                <span>Add team</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
