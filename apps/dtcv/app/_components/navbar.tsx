import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AvatarButton } from "./avatar-button";

export function NavBar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <AvatarButton />
    </header>
  );
}
