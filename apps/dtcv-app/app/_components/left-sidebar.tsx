import { Plus } from 'lucide-react';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { ChevronsUpDown, MapPinIcon } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { MapPinnedIcon } from 'lucide-react';

const data = {
  features: [
    { name: 'Building', type: 'Building' },
    { name: 'Tree', type: 'Tree' },
    { name: 'Street', type: 'Street' },
  ],
};

export function LeftSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { project, projects, user } = useAppContext();

  async function triggerWorkflow() {
    try {
      const response = await fetch('http://localhost:5678/webhook-test/trigger-dtcc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const result = await response.json();
      console.log(result);
    } catch (error: any) {
      console.error('Error triggering workflow:', error);
    }
  }
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={triggerWorkflow}>Trigger DTCC</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel>City objects</SidebarGroupLabel>
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
