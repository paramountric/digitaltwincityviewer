import CreateProjectDialog from "./_components/create-project-dialog";
import DeleteProjectDialog from "./_components/delete-project-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditFeatureProvider } from "@/context/edit-feature-context";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EditFeatureProvider>
      <TooltipProvider delayDuration={200}>
        <div>{children}</div>
        <CreateProjectDialog />
        <DeleteProjectDialog />
      </TooltipProvider>
    </EditFeatureProvider>
  );
}
