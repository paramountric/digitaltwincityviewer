import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
);

test.describe('User Authentication Sync', () => {
  test.beforeEach(async () => {
    // Clean up test data
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.signOut();
    }
    // Clean up speckle users table
    await supabase.from('users').delete().neq('id', '0');
  });

  test.only('should sync user creation from Supabase to Speckle', async () => {
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
      company: faker.company.name(),
      bio: faker.lorem.sentence(),
    };

    // Create user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
          company: testUser.company,
          bio: testUser.bio,
        },
      },
    });

    console.log('Auth Data:', authData);
    console.log('Auth Error:', authError);

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();

    // Give the trigger more time to execute
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Debug: Check if trigger exists
    const { data: triggerData } = await supabase
      .from('pg_trigger')
      .select('*')
      .eq('tgname', 'on_auth_user_created');
    console.log('Trigger exists:', triggerData);

    // Check if user was synced to Speckle users table
    const { data: speckleUser, error: speckleError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email);

    console.log('Speckle User Query Result:', speckleUser);
    console.log('Speckle Error:', speckleError);

    // Modified expectations to help debug
    if (speckleError) {
      console.error('Speckle Error Details:', speckleError);
    }

    expect(speckleError).toBeNull();
    expect(speckleUser).toBeDefined();
    expect(speckleUser?.[0]?.email).toBe(testUser.email);
    expect(speckleUser?.[0]?.name).toBe(testUser.name);

    // Check users_meta table for additional fields
    const { data: userMeta, error: metaError } = await supabase
      .from('users_meta')
      .select('*')
      .eq('user_id', speckleUser?.[0]?.id);

    expect(metaError).toBeNull();
    expect(userMeta).toBeDefined();

    // Check specific metadata values
    const findMetaValue = (key: string) => userMeta?.find((m) => m.key === key)?.value;

    expect(findMetaValue('company')).toBe(testUser.company);
    expect(findMetaValue('bio')).toBe(testUser.bio);
  });

  test('should sync user updates between systems', async () => {
    // First create a user
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
      company: faker.company.name(),
    };

    const {
      data: { user },
    } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
          company: testUser.company,
        },
      },
    });
    expect(user).toBeDefined();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update user metadata
    const newName = faker.person.fullName();
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        name: newName,
      },
    });

    expect(updateError).toBeNull();

    // Give the trigger time to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify update in Speckle users table
    const { data: speckleUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single();

    expect(speckleUser.name).toBe(newName);

    // Verify update in users_meta
    const { data: userMeta } = await supabase
      .from('users_meta')
      .select('*')
      .eq('user_id', speckleUser.id)
      .eq('key', 'name')
      .single();

    expect(userMeta.value).toBe(newName);
  });

  test('should sync user deletion between systems', async () => {
    // Create test user
    const {
      data: { user },
    } = await supabase.auth.signUp({
      email: faker.internet.email(),
      password: faker.internet.password(),
    });
    expect(user).toBeDefined();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Delete from auth using admin client
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user!.id);
    expect(deleteError).toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify deleted from Speckle users
    const { data: speckleUser, error: speckleError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user!.email)
      .single();

    expect(speckleError).toBeDefined();
    expect(speckleUser).toBeNull();

    // Verify deleted from users_meta
    const { data: userMeta } = await supabase
      .from('users_meta')
      .select('*')
      .eq('user_id', user!.id);

    expect(userMeta).toHaveLength(0);
  });
});
