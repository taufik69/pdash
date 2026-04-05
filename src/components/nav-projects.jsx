import React from "react";
import { Folder, Forward, MoreHorizontal, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

/*
  Palette (matches NavMain):
    Amber    → #da7708
    Dark BG  → #111827
    Surface  → #1f2937
    Muted    → #374151
    Text     → #f9fafb
    Subtext  → #9ca3af
*/

const styles = `
  .nav-projects-group {
    padding: 0 8px;
    font-family: 'DM Mono', 'Fira Mono', 'Courier New', monospace;
  }

  /* Group label — same treatment as NavMain */
  .nav-projects-group .sidebar-group-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #da7708;
    padding: 12px 8px 8px;
  }

  .nav-projects-group .sidebar-group-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #da770840, transparent);
    margin-left: 8px;
  }

  /* Project row */
  .proj-item {
    position: relative;
    display: flex;
    align-items: center;
  }

  .proj-button {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    padding: 8px 10px;
    border-radius: 4px;
    color: #d1d5db;
    background: transparent;
    border: 1px solid transparent;
    text-decoration: none;
    font-size: 13px;
    font-family: inherit;
    font-weight: 400;
    letter-spacing: 0.01em;
    transition: all 0.14s ease;
    position: relative;
    overflow: hidden;
  }

  .proj-button::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #da7708;
    transform: scaleY(0);
    transition: transform 0.14s ease;
    border-radius: 0 1px 1px 0;
  }

  .proj-button:hover {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .proj-button:hover::before {
    transform: scaleY(1);
  }

  .proj-button:hover .proj-icon {
    color: #da7708;
  }

  .proj-icon {
    width: 14px;
    height: 14px;
    color: #6b7280;
    flex-shrink: 0;
    transition: color 0.14s ease;
  }

  /* More / action trigger */
  .proj-action-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 3px;
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.12s ease, background 0.12s ease, color 0.12s ease;
    flex-shrink: 0;
    margin-right: 6px;
  }

  .proj-item:hover .proj-action-trigger,
  .proj-action-trigger[data-state="open"] {
    opacity: 1;
  }

  .proj-action-trigger:hover,
  .proj-action-trigger[data-state="open"] {
    background: #374151;
    color: #da7708;
  }

  .proj-action-trigger svg {
    width: 13px;
    height: 13px;
  }

  /* Dropdown */
  .proj-dropdown {
    background: #1f2937 !important;
    border: 1px solid #374151 !important;
    border-radius: 6px !important;
    padding: 4px !important;
    box-shadow: 0 8px 24px #00000060 !important;
    font-family: 'DM Mono', 'Fira Mono', 'Courier New', monospace;
    min-width: 168px !important;
  }

  .proj-dropdown-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 10px;
    border-radius: 3px;
    font-size: 12px;
    font-family: inherit;
    color: #9ca3af;
    cursor: pointer;
    transition: background 0.1s ease, color 0.1s ease;
    letter-spacing: 0.01em;
  }

  .proj-dropdown-item svg {
    width: 13px;
    height: 13px;
    color: #6b7280;
    flex-shrink: 0;
    transition: color 0.1s ease;
  }

  .proj-dropdown-item:hover {
    background: #111827;
    color: #f9fafb;
  }

  .proj-dropdown-item:hover svg {
    color: #da7708;
  }

  .proj-dropdown-item.danger:hover {
    background: #2d1a1a;
    color: #f87171;
  }

  .proj-dropdown-item.danger:hover svg {
    color: #f87171;
  }

  .proj-dropdown-sep {
    height: 1px;
    background: #374151;
    margin: 4px 0;
  }

  /* "More" footer button */
  .proj-more-button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 7px 10px;
    border-radius: 4px;
    color: #6b7280;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    font-weight: 400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: all 0.14s ease;
    margin-top: 2px;
  }

  .proj-more-button svg {
    width: 13px;
    height: 13px;
  }

  .proj-more-button:hover {
    background: #1f2937;
    border-color: #374151;
    color: #da7708;
  }
`;

export function NavProjects({ projects }) {
  const { isMobile } = useSidebar();

  return (
    <>
      <style>{styles}</style>
      <SidebarGroup className="nav-projects-group group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>

        <SidebarMenu>
          {projects.map((item) => (
            <SidebarMenuItem key={item.name} className="proj-item">
              <SidebarMenuButton asChild>
                <a href={item.url} className="proj-button">
                  <item.icon className="proj-icon" />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="proj-action-trigger"
                  >
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="proj-dropdown"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem className="proj-dropdown-item">
                    <Folder />
                    <span>View Project</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="proj-dropdown-item">
                    <Forward />
                    <span>Share Project</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="proj-dropdown-sep" />

                  <DropdownMenuItem className="proj-dropdown-item danger">
                    <Trash2 />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton className="proj-more-button">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
