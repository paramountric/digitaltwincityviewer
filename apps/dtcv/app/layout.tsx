import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/app-context";
import { createClient } from "@/utils/supabase/server";
import {
  DbProfile,
  DbUser,
  Feature,
  Project,
  UserWithProfile,
} from "@/app/types";
import {
  dbFeatureToFeature,
  dbProjectToProject,
  dbUserToUserWithProfile,
} from "./types/type-utils";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Digital Twin City Viewer",
  description: "Digital Twin City Viewer",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = createClient();

  let userWithProfile: UserWithProfile | null = null;
  let project: Project | null = null;
  let projects: Project[] = [];
  let features: Feature[] = [];

  let message: string | null = null;

  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    const { data: profileData, error: profileError } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      console.error("Error fetching profile", profileError);
    }

    const profile = profileData || {
      id: user.id,
      display_name: user.email || null,
      email: user.email!,
      image_url: null,
    };

    userWithProfile = dbUserToUserWithProfile(
      user as unknown as DbUser,
      profile as unknown as DbProfile
    );

    const { data: userProjectsData, error: userProjectsError } = await client
      .from("project_collaborators")
      .select("project_id")
      .eq("user_id", user.id);

    if (userProjectsError) {
      message = "Error fetching user projects";
    }

    const projectIds = userProjectsData?.map((up) => up.project_id) || [];

    const { data: projectsData, error: projectsError } = await client
      .from("projects")
      .select("*")
      .in("id", projectIds);

    if (projectsError) {
      message = "Error fetching projects";
    }

    projects = (projectsData || []).map(dbProjectToProject);

    if (userWithProfile && userWithProfile.profile.activeProjectId) {
      project =
        projects.find(
          (project) => project.id === userWithProfile!.profile.activeProjectId
        ) || null;

      const { data: featuresData, error: featuresError } = await client
        .from("features")
        .select("*")
        .eq("project_id", project?.id ?? "");

      if (featuresError) {
        message = "Error fetching features";
      }

      features = (featuresData || []).map(dbFeatureToFeature);
    } else {
      message = "User not found";
    }
  } else {
    message = "User not found";
  }

  if (message) {
    console.log(message);
  }

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-black dark:text-white`}
      >
        <AppProvider
          user={userWithProfile}
          project={project}
          projects={projects}
          features={features}
        >
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
