import React from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

/*
  Palette:
    Amber    → #da7708
    Dark BG  → #111827
    Surface  → #1f2937   (slightly lighter dark for contrast)
    Muted    → #374151   (borders, dividers)
    Text     → #f9fafb
    Subtext  → #9ca3af
*/

const styles = `
  .nav-main-group {
    padding: 0 8px;
    font-family: 'DM Mono', 'Fira Mono', 'Courier New', monospace;
  }

  /* Group label */
  .nav-main-group .sidebar-group-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #da7708;
    padding: 12px 8px 8px;
    position: relative;
  }

  .nav-main-group .sidebar-group-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #da770840, transparent);
    margin-left: 8px;
  }

  /* Menu item button */
  .nav-item-button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border-radius: 4px;
    color: #d1d5db;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: all 0.15s ease;
    position: relative;
    overflow: hidden;
  }

  .nav-item-button::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #da7708;
    transform: scaleY(0);
    transition: transform 0.15s ease;
    border-radius: 0 1px 1px 0;
  }

  .nav-item-button:hover {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .nav-item-button:hover::before {
    transform: scaleY(1);
  }

  .nav-item-button:hover .nav-item-icon {
    color: #da7708;
  }

  /* Active/open state */
  .group\/collapsible[data-state="open"] .nav-item-button {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .group\/collapsible[data-state="open"] .nav-item-button::before {
    transform: scaleY(1);
  }

  .group\/collapsible[data-state="open"] .nav-item-icon {
    color: #da7708;
  }

  .nav-item-icon {
    width: 15px;
    height: 15px;
    color: #6b7280;
    flex-shrink: 0;
    transition: color 0.15s ease;
  }

  .nav-item-label {
    flex: 1;
    text-align: left;
  }

  .nav-chevron {
    width: 13px;
    height: 13px;
    color: #6b7280;
    flex-shrink: 0;
    transition: transform 0.2s ease, color 0.15s ease;
  }

  .group\/collapsible[data-state="open"] .nav-chevron {
    transform: rotate(90deg);
    color: #da7708;
  }

  /* Sub menu */
  .nav-sub-menu {
    margin: 2px 0 4px;
    padding-left: 18px;
    border-left: 1px solid #374151;
    margin-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .nav-sub-item-button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 10px;
    border-radius: 3px;
    color: #9ca3af;
    background: transparent;
    font-size: 12px;
    font-family: inherit;
    font-weight: 400;
    letter-spacing: 0.01em;
    text-decoration: none;
    transition: all 0.12s ease;
    position: relative;
  }

  .nav-sub-item-button::before {
    content: '';
    position: absolute;
    left: -13px;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 1px;
    background: #374151;
    transition: background 0.12s ease, width 0.12s ease;
  }

  .nav-sub-item-button:hover {
    color: #f9fafb;
    background: #1f293780;
  }

  .nav-sub-item-button:hover::before {
    background: #da7708;
    width: 8px;
    left: -16px;
  }

  /* Collapsible animation */
  [data-state="closed"] .nav-sub-wrapper {
    animation: slideUp 0.15s ease forwards;
  }

  [data-state="open"] .nav-sub-wrapper {
    animation: slideDown 0.18s ease forwards;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-4px); }
  }
`;

export function NavMain({ items }) {
  return (
    <>
      <style>{styles}</style>
      <SidebarGroup className="nav-main-group">
        <SidebarGroupLabel>Platform</SidebarGroupLabel>

        <SidebarMenu>
          {items.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="nav-item-button"
                  >
                    {item.icon && <item.icon className="nav-item-icon" />}
                    <span className="nav-item-label">{item.title}</span>
                    <ChevronRight className="nav-chevron" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub className="nav-sub-menu nav-sub-wrapper">
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to={subItem.url}
                            className="nav-sub-item-button"
                          >
                            {subItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
