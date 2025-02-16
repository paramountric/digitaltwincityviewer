import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { createClient } from '@/utils/supabase/server';
import {
  DbProfile,
  DbUser,
  Project,
  UserWithProfile,
  dbProjectToProject,
  dbUserToUserWithProfile,
} from '@/model';
import { Feature } from '@/viewport';
import { InteractionProvider } from '@/context/interaction-context';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'Digital Twin City Viewer',
  description: 'Digital Twin City Viewer',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await createClient();

  let userWithProfile: UserWithProfile | null = null;
  let project: Project | null = null;
  let projects: Project[] = [];
  let features: Feature[] = [];

  let message: string | null = null;

  try {
    const {
      data: { user },
    } = await client.auth.getUser().catch((error) => {
      console.error('Error fetching user:', error);
      return { data: { user: null } };
    });

    if (user) {
      const { data: speckleUser, error: speckleUserError } = await client
        .from('users')
        .select('*')
        .eq('suuid', user.id)
        .single();
      if (speckleUserError || !speckleUser) {
        console.error('Error fetching speckle user', speckleUserError);
      }
      const profile = speckleUser || {
        id: user.id,
        display_name: user.email || null,
        email: user.email!,
        image_url: null,
      };
      userWithProfile = dbUserToUserWithProfile(
        user as unknown as DbUser,
        profile as unknown as DbProfile
      );
    } else {
      message = 'User not found';
    }
  } catch (error) {
    console.error('Root layout error:', error);
  }

  return (
    <html lang="en" className="dark">
      <body className={`bg-white dark:bg-[hsl(222.2,84%,1%)] text-black dark:text-white`}>
        <AppProvider
          user={userWithProfile}
          project={project}
          projects={projects}
          features={features}
        >
          <InteractionProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </InteractionProvider>
        </AppProvider>
      </body>
    </html>
  );
}
