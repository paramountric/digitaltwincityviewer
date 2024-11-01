"use server";

import { createClient } from "@/utils/supabase/server";
import { Project } from "@/types";

export const validateProjectName = (name: string) => {
  // Regex to allow a wide range of characters for project names
  const validNameRegex =
    /^[a-zA-ZåäöÅÄÖæøåÆØÅéèêëÉÈÊËíìîïÍÌÎÏóòôõÓÒÔÕúùûüÚÙÛÜñÑçÇ\d\s\-_.'&()]+$/;
  return validNameRegex.test(name) && name.trim().length > 0;
};

export async function createProject(
  name: string,
  description: string,
  userId: string
) {
  if (!validateProjectName(name)) {
    throw new Error(
      "Invalid project name. Use only common letters, numbers, spaces, hyphens, and underscores."
    );
  }

  const client = createClient();

  const newProject: Partial<Project> = {
    name,
    description,
  };
  const { data: projectData, error: projectError } = await client
    .from("projects")
    .insert(newProject)
    .select()
    .single();

  if (projectError) {
    throw new Error("Could not create project. Please try again.");
  }

  const { error: profileUpdateError } = await client
    .from("profiles")
    .update({ active_project_id: projectData.id })
    .eq("id", userId)
    .select()
    .single();

  if (profileUpdateError) {
    throw new Error("Failed to update active project");
  }

  return {
    project: {
      ...projectData,
      created_at: new Date(projectData.created_at).toISOString(),
      updated_at: new Date(projectData.updated_at).toISOString(),
    } as Project,
  };
}
