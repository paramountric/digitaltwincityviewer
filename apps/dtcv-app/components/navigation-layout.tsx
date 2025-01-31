import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarRightProvider } from '@/components/ui/sidebar-right';

interface NavigationLayoutProps {
  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;
  leftSidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar: React.ReactNode;
}

export function NavigationLayout({
  showLeftSidebar,
  setShowLeftSidebar,
  showRightSidebar,
  setShowRightSidebar,
  leftSidebar,
  mainContent,
  rightSidebar,
}: NavigationLayoutProps) {
  return (
    <SidebarProvider open={showLeftSidebar} onOpenChange={setShowLeftSidebar}>
      <SidebarRightProvider open={showRightSidebar} onOpenChange={setShowRightSidebar}>
        <div className="flex w-full">
          {leftSidebar}
          {mainContent}
          {rightSidebar}
        </div>
      </SidebarRightProvider>
    </SidebarProvider>
  );
}
