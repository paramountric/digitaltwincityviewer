import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  _SidebarRight,
  SidebarRightContent,
  SidebarRightFooter,
  SidebarRightHeader,
  SidebarRightMenu,
  SidebarRightMenuButton,
  SidebarRightMenuItem,
  SidebarRightProvider,
  useSidebarRight,
} from '@/components/ui/sidebar-right';
import Footer from './footer';
import { Feature } from '@dtcv/viewport';
import { NavBar } from './navbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPinIcon, MapPinnedIcon, Plus } from 'lucide-react';
import { ChevronsUpDown } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import ProjectSidebarContent from './project-sidebar-content';
import { Toolbar } from './toolbar';

const features: Feature[] = [
  {
    key: 'feature-1',
    name: 'Feature 1',
    type: 'Building',
  },
];
// This is sample data.
const data = {
  features,
};

interface NavigationProps {
  children?: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  return (
    <SidebarProvider>
      <SidebarRightProvider>
        <div className="pointer-events-auto">
          <AppSidebar />
        </div>
        <SidebarInset className="bg-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <NavBar />
          </div>
          {children || (
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* This area remains pointer-events-none */}
            </div>
          )}
          <div className="pointer-events-auto">
            <Footer />
          </div>
        </SidebarInset>
        <SidebarRight />
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
          <div className="mx-auto max-w-screen-xl p-2">
            {/* <div className="flex items-center justify-center gap-2">
              <Toolbar />
            </div> */}
          </div>
        </div>
      </SidebarRightProvider>
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
                    <span className="truncate font-semibold">{project?.name || 'Project'}</span>
                    <span className="truncate text-xs">{user?.profile.name}</span>
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
                    {project.name || 'Project'}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add project</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ProjectSidebarContent />
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

function SidebarRight({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <_SidebarRight collapsible="offcanvas" side="right" {...props}>
      <SidebarRightHeader className="h-16 border-b border-sidebar-border">
        Feature
      </SidebarRightHeader>
      <SidebarRightContent>Feature details</SidebarRightContent>
      <SidebarRightFooter>
        <SidebarRightMenu>
          <SidebarRightMenuItem>
            <SidebarRightMenuButton>Feature action</SidebarRightMenuButton>
          </SidebarRightMenuItem>
        </SidebarRightMenu>
      </SidebarRightFooter>
    </_SidebarRight>
  );
}
