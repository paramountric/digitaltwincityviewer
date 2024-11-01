import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useAppContext } from "@/context/app-context";
import {
  ArrowDownToDot,
  ChevronRight,
  LocateFixedIcon,
  LocateIcon,
  PinIcon,
} from "lucide-react";
import { DEFAULT_MAP_COORDINATES } from "@dtcv/viewport";

export default function ProjectSidebarContent() {
  const { project } = useAppContext();

  if (!project) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={project.name}>
              <a href="#">
                <LocateIcon />
                <span>Site location</span>
              </a>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem key={"longitude"}>
                  <SidebarMenuSubButton className="hover:bg-inherit">
                    <ArrowDownToDot />
                    <span>
                      Lon{" "}
                      {project.properties?.longitude ??
                        DEFAULT_MAP_COORDINATES[0]}
                    </span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem key={"latitude"}>
                  <SidebarMenuSubButton className="hover:bg-inherit">
                    <ArrowDownToDot />
                    <span>
                      Lat{" "}
                      {project.properties?.latitude ??
                        DEFAULT_MAP_COORDINATES[1]}
                    </span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem key={"site-location"}>
                  <SidebarMenuSubButton className="bg-secondary rounded-lg hover:cursor-pointer">
                    <PinIcon />
                    <span>Use current map center</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
