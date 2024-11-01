import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/app-context";
import { Project } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/dist/client/components/navigation";

export function ProjectsList() {
  const { projects, user, setProject, setUser, setFeatures } = useAppContext();
  const router = useRouter();

  const profileId = user?.profile?.id;

  const setActiveProject = async (project: Project) => {
    if (!user) return;

    const projectId = project.id;

    const client = createClient();
    const { error: updateError } = await client
      .from("profiles")
      .update({ active_project_id: projectId })
      .eq("id", profileId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update active project:", updateError);
      return;
    }

    setUser({
      ...user,
      profile: { ...user.profile, activeProjectId: projectId },
    });
    setProject(project);
    const { data, error: loadError } = await client
      .from("features")
      .select()
      .eq("project_id", projectId);
    if (loadError) {
      console.error("Failed to load features:", loadError);
      return;
    }
    if (data) {
      setFeatures(data);
    }
    router.push(`/projects/${projectId}`);
  };

  if (!projects || projects.length === 0) {
    return (
      <main className="flex flex-col min-h-[calc(100vh-64px)] gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-semibold md:text-3xl">Projects</h1>
        </div>
        <div className="flex flex-grow items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center px-4 py-8">
            <h3 className="text-3xl font-bold tracking-tight">
              You have no projects
            </h3>
            <p className="text-lg text-muted-foreground max-w-md">
              Create your first project to get started!
            </p>
            <Button className="mt-6 text-lg px-6 py-3">Create project</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-semibold md:text-3xl">Projects</h1>
      </div>
    </div>
  );
}
