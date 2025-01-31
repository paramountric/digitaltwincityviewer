import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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
} from "@/components/ui/sidebar-right";
import { useAppContext } from "@/context/app-context";
import { ChevronRightIcon } from "lucide-react";

export function RightSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { setShowRightSidebar, showRightSidebar } = useAppContext();

  return (
    <_SidebarRight
      collapsible="offcanvas"
      side="right"
      {...props}
      className="border-none bg-primary/50"
    >
      <SidebarRightHeader className="h-[72px] flex justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-white ml-1"
              size="lg"
              onClick={() => setShowRightSidebar(!showRightSidebar)}
            >
              <ChevronRightIcon
                className="!h-6 !w-6 min-h-[1rem] min-w-[1rem] shrink-0 bg-secondary text-primary rounded-md p-1"
                strokeWidth={1.5}
              />
              <span className="text-lg "> Title</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarRightHeader>
      <SidebarRightContent className="p-6">Content</SidebarRightContent>
    </_SidebarRight>
  );
}
