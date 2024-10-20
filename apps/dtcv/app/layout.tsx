import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/app-context";
import { createClient } from "@/utils/supabase/server";
import { DbProfile, DbUser, Project, UserWithProfile } from "@/types";
import {
  dbFeatureToFeature,
  dbProjectToProject,
  dbUserToUserWithProfile,
} from "../types/type-utils";
import { Feature } from "@dtcv/viewport";
import Link from "next/link";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[hsl(222.2,84%,1%)] text-black dark:text-white`}
      >
        <AppProvider
          user={userWithProfile}
          project={project}
          projects={projects}
          features={features}
        >
          {children}
          <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black bg-opacity-50 text-white text-xs p-2 flex justify-end items-center">
            <div className="flex items-center">
              © 2024 Digital Twin City Viewer
              <Link
                href="https://github.com/paramountric/digitaltwincityviewer"
                className="ml-2 hover:text-gray-300"
                aria-label="GitHub Repository"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </Link>
            </div>
            <div id="credits" className="ml-2"></div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
