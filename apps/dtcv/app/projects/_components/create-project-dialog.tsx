"use client";

import { useState, ChangeEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createProject } from "@/actions/create-project";
import { LoadingButtonSpinner } from "@/components/loading-button-spinner";

export default function CreateProjectDialog() {
  const {
    activeDialogId,
    setActiveDialogId,
    projects,
    setProjects,
    setProject,
    user,
  } = useAppContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleCreateProject = async () => {
    if (!user?.id) {
      toast.error("No user information. Please reload the page.");
      return;
    }

    if (!name.trim()) {
      setNameError("Project name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createProject(name, description, user.id);

      setProjects([...(projects || []), result.project]);
      setProject(result.project);
      setActiveDialogId(null);
      toast.success("Project created successfully.");
      window.location.href = `/projects/${result.project.id}`;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the project."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={activeDialogId === "create-project"}
      onOpenChange={() => setActiveDialogId(null)}
    >
      <DialogContent className="flex flex-col overflow-auto w-full sm:w-[95%] md:w-[50%] max-w-none px-8">
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="w-full max-w-xs">
            <Input
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              className="w-full rounded-sm"
            />
            {nameError && (
              <div className="text-red-500 text-sm mt-1">{nameError}</div>
            )}
          </div>
          <Textarea
            placeholder="Project description"
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
            className="max-w-xs w-full rounded-sm"
          />

          <Button
            onClick={handleCreateProject}
            className="max-w-xs w-full rounded-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingButtonSpinner />
                Creating project...
              </>
            ) : (
              "Create project"
            )}
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" className="rounded-sm">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
