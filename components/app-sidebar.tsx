"use client"

import * as React from "react"
import {
  IconDashboard,
  IconUsers,
  IconShield,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
      items: [
        {
          title: "All Users",
          url: "/users",
        },
        {
          title: "Create User",
          url: "/users/new",
        },
      ],
    },
    {
      title: "Access Control",
      url: "/roles",
      icon: IconShield,
      items: [
        {
          title: "Roles",
          url: "/roles",
        },
        {
          title: "Permissions",
          url: "/permissions",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ 
  user,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
}) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Logo href="/dashboard" className="text-base font-semibold" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name || "Guest",
          email: user?.email || "guest@example.com",
          avatar: user?.image || "",
          initials: user?.name ? getInitials(user.name) : "GU",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
