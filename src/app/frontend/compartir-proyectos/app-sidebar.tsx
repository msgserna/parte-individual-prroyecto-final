"use client";

import * as React from "react";
import { Folder, Home } from "lucide-react";
import Image from "next/image";

import { NavMain } from "@/app/frontend/compartir-proyectos/nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/frontend/components/ui/sidebar";
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    { title: "Home", url: "/proyectos-curso", icon: Home },
    { title: "Proyectos", url: "/proyectos-curso", icon: Folder },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const navMain = data.navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname.startsWith(`${item.url}/`),
  }));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/proyectos-curso">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg overflow-hidden">
                  <Image
                    src="/imagenes/logo.png"
                    alt="FProject"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div className="grid text-left text-sm">
                  <span className="font-medium">FProject</span>
                  <span className="text-xs">Proyectos</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
