"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useAppContext } from "@/context/app-context";
import { createClient } from "@/utils/supabase/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

export default function DeleteProjectDialog() {
  const {
    activeDialogId,
    setActiveDialogId,
    projects,
    setProject,
    setProjects,
    project,
  } = useAppContext();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDeleteProject = async () => {
    if (!project) return;
    setError("");
    const client = createClient();

    try {
      const { error: deleteEntitiesError } = await client
        .from("entities")
        .delete()
        .eq("project_id", project.id);
      if (deleteEntitiesError) throw deleteEntitiesError;

      const { error: projectError } = await client
        .from("projects")
        .delete()
        .eq("id", project.id);
      if (projectError) throw projectError;

      setProjects(projects?.filter((p) => p.id !== project.id) || []);
      if (project?.id === project.id) {
        setProject(null);
      }

      setActiveDialogId(null);
      router.push("/projects");
    } catch (error) {
      setError("Could not delete project. Please try again.");
    }
  };

  return (
    <Dialog
      open={activeDialogId === "delete-project"}
      onOpenChange={() => setActiveDialogId(null)}
    >
      <DialogContent className="flex flex-col overflow-auto w-full sm:w-[95%] md:w-[50%] max-w-none px-8">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <p className="text-center">
            Are you sure you want to delete the project <b>{project?.name}</b>?
            This action cannot be undone.
          </p>
          <Button
            onClick={handleDeleteProject}
            variant="destructive"
            className="max-w-xs w-full flex items-center justify-center"
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete project
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
