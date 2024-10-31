import * as React from "react";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Footer from "./footer";
import { Feature } from "@dtcv/viewport";
import { NavBar } from "./navbar";

const features: Feature[] = [
  {
    key: "feature-1",
    name: "Feature 1",
    type: "Building",
  },
];
// This is sample data.
const data = {
  features,
};

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <NavBar />
        <div className="flex flex-1 flex-col gap-4 p-4 pointer-events-none"></div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.features.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton>{item.name}</SidebarMenuButton>
                  <SidebarMenuBadge>{item.type}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
