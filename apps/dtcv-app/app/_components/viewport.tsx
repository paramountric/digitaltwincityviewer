import { NavigationLayout } from '@/components/navigation-layout';
import { SidebarInset } from '@/components/ui/sidebar';
import { useAppContext } from '@/context/app-context';
import { LeftSidebar } from './left-sidebar';
import Footer from './footer';
import { NavBar } from './navbar';
import { RightSidebar } from './right-sidebar';

export default function Viewport({ children }: { children?: React.ReactNode }) {
  const { showLeftSidebar, setShowLeftSidebar, showRightSidebar, setShowRightSidebar } =
    useAppContext();
  return (
    <NavigationLayout
      showLeftSidebar={showLeftSidebar}
      setShowLeftSidebar={setShowLeftSidebar}
      showRightSidebar={showRightSidebar}
      setShowRightSidebar={setShowRightSidebar}
      leftSidebar={
        <div className="pointer-events-auto">
          <LeftSidebar />
        </div>
      }
      mainContent={
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
      }
      rightSidebar={
        <div className="pointer-events-auto">
          <RightSidebar />
        </div>
      }
    />
  );
}
