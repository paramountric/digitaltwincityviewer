import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AppProvider } from "@/context/app-context";
import CreateProjectDialog from "./projects/_components/create-project-dialog";
import DeleteProjectDialog from "./projects/_components/delete-project-dialog";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DbProfile, DbUser, Profile, Project, UserWithProfile } from "@/types";
import {
  dbFeatureToFeature,
  dbProjectToProject,
  dbUserToUserWithProfile,
} from "@/types/type-utils";
import { Feature } from "@dtcv/viewport";
import { EditFeatureProvider } from "@/context/edit-feature-context";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profileData, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profileData) {
    console.error("Error fetching profile", profileError);
  }

  const profile: Profile = profileData || {
    id: user.id,
    display_name: user.email || null,
    email: user.email!,
    image_url: null,
  };

  const userWithProfile: UserWithProfile = dbUserToUserWithProfile(
    user as unknown as DbUser,
    profile as unknown as DbProfile
  );

  const { data: userProjectsData, error: userProjectsError } = await client
    .from("user_projects")
    .select("project_id")
    .eq("user_id", user.id);

  if (userProjectsError) {
    console.error("Error fetching user projects", userProjectsError);
  }

  const projectIds = userProjectsData?.map((up) => up.project_id) || [];

  const { data: projectsData, error: projectsError } = await client
    .from("projects")
    .select("*")
    .in("id", projectIds);

  if (projectsError) {
    console.error("Error fetching projects", projectsError);
  }

  const projects: Project[] = (projectsData || []).map(dbProjectToProject);

  const project: Project | null =
    projects.find(
      (project) => project.id === userWithProfile.profile.activeProjectId
    ) || null;

  const { data: featuresData, error: featuresError } = await client
    .from("features")
    .select("*")
    .eq("project_id", project?.id ?? "");

  if (featuresError) {
    console.error("Error fetching features", featuresError);
  }

  const features: Feature[] = (featuresData || []).map(dbFeatureToFeature);

  return (
    <EditFeatureProvider>
      <AppProvider
        user={userWithProfile}
        project={project}
        projects={projects}
        features={features}
      >
        <TooltipProvider delayDuration={200}>
          {children}
          <CreateProjectDialog />
          <DeleteProjectDialog />
        </TooltipProvider>
        <Toaster richColors />
      </AppProvider>
    </EditFeatureProvider>
  );
}
