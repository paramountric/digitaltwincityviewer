import { Plus } from "lucide-react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/sidebar";
import { ChevronsUpDown, MapPinIcon } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { MapPinnedIcon } from "lucide-react";
import workflow from "@/workflows/dtcc-example.json";
import { toast } from "sonner";
import { setupWorkflow } from "@/actions/workflows";
import { triggerDtccWorkflow } from "@/actions/dtcc";
import { Feature } from "@/viewport";

export function LeftSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { project, projects, user, setFeatures } = useAppContext();

  async function uploadWorkflow() {
    try {
      const result = await setupWorkflow(workflow);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log("Workflow setup complete:", result.workflowId);
      toast.success("Workflow uploaded successfully");
    } catch (error) {
      console.error("Error uploading workflow:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload workflow"
      );
    }
  }

  async function triggerWorkflow() {
    const { success, error } = await triggerDtccWorkflow();

    console.log(success, error);
  }

  function showDTCCOutput() {
    const groundFeature: Feature = {
      id: "ground",
      key: "ground",
      properties: {
        _fillColor: [67, 160, 71, 255],
        _gltfUrl:
          "http://localhost:8001/data/data/helsingborg-residential-2022/glb_output/ground2.glb",
      },
    };

    const buildingsFeature: Feature = {
      id: "buildings",
      key: "buildings",
      properties: {
        _fillColor: [255, 255, 255, 255],
        _gltfUrl:
          "http://localhost:8001/data/data/helsingborg-residential-2022/glb_output/building2.glb",
      },
    };
    setFeatures([groundFeature, buildingsFeature]);
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
                    <span className="truncate font-semibold">
                      {project?.name || "Project"}
                    </span>
                    <span className="truncate text-xs">
                      {user?.profile.name}
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="px-4" onClick={uploadWorkflow}>
              Upload workflow
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="px-4" onClick={triggerWorkflow}>
              Trigger DTCC
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="px-4" onClick={showDTCCOutput}>
              Show DTCC output in viewer
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
