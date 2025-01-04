'use client';

import {
  Cloud,
  CreditCard,
  FolderIcon,
  FolderOpen,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/context/app-context';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Project } from '@dtcv/model';

export function AvatarButton() {
  const { user, projects, project, setProject } = useAppContext();
  const router = useRouter();
  const supabase = createClient();

  const firstLetter = (
    user?.profile?.name?.charAt(0) ||
    user?.email?.charAt(0) ||
    '?'
  ).toUpperCase();
  const userProfileImg = user?.profile?.avatar;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProjectSelect = async (selectedProject: Project) => {
    // try {
    //   if (!user) {
    //     console.error('User not found');
    //     return;
    //   }
    //   // Update the active project ID for the user in the database
    //   const { error } = await supabase
    //     .from('profiles')
    //     .update({ active_project_id: selectedProject.id })
    //     .eq('id', user.profile.id);
    //   if (error) throw error;
    //   setProject(selectedProject);
    //   router.push(`/projects/${selectedProject.id}`);
    // } catch (error) {
    //   console.error('Error setting active project:', error);
    // }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full w-10 h-10 p-0 overflow-hidden text-xl">
          {userProfileImg ? (
            <img src={userProfileImg} alt="User profile" className="w-full h-full object-cover" />
          ) : (
            firstLetter
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={5}>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onSelect={() => handleProjectSelect(project)}
                    >
                      <FolderIcon className="mr-2 h-4 w-4" />
                      <span>{project.name}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>
                    <span>There are no projects</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New project</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
