import * as React from "react";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPinIcon, MapPinnedIcon, Plus } from "lucide-react";
import { ChevronsUpDown } from "lucide-react";
import { useAppContext } from "@/context/app-context";

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

export default function Navigation() {
  return (
    <SidebarProvider>
      <div className="pointer-events-auto">
        <AppSidebar />
      </div>
      <SidebarInset className="bg-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <NavBar />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* This area remains pointer-events-none */}
        </div>
        <div className="pointer-events-auto">
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { project, projects, user } = useAppContext();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                    <MapPinnedIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {project?.name || "Project"}
                    </span>
                    <span className="truncate text-xs">
                      {user?.profile.displayName}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Projects
                </DropdownMenuLabel>
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.name}
                    // onClick={() => setActiveProject(project)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <MapPinIcon className="size-4 shrink-0" />
                    </div>
                    {project.name || "Project"}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add project
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
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
