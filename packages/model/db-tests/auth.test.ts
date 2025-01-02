import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

test.describe.only('User Authentication Sync', () => {
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

  test('should sync user creation from Supabase to Speckle', async () => {
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

    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();

    // Give the trigger time to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user was synced to Speckle users table
    const { data: speckleUser, error: speckleError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user!.id)
      .single();

    expect(speckleError).toBeNull();
    expect(speckleUser).toBeDefined();
    expect(speckleUser.email).toBe(testUser.email);
    expect(speckleUser.name).toBe(testUser.name);
    expect(speckleUser.company).toBe(testUser.company);
    expect(speckleUser.bio).toBe(testUser.bio);
  });

  test('should sync user updates between systems', async () => {
    // First create a user
    const testUser = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
    };

    const {
      data: { user },
    } = await supabase.auth.signUp(testUser);
    expect(user).toBeDefined();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update user in Speckle
    const updatedName = faker.person.fullName();
    const { error: updateError } = await supabase
      .from('users')
      .update({ name: updatedName })
      .eq('id', user!.id);

    expect(updateError).toBeNull();

    // Give the trigger time to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify update synced to auth.users
    const {
      data: { user: updatedUser },
    } = await supabase.auth.getUser();
    expect(updatedUser!.user_metadata.name).toBe(updatedName);
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

    // Delete from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user!.id);
    expect(deleteError).toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify deleted from Speckle users
    const { data: speckleUser, error: speckleError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user!.id)
      .single();

    expect(speckleError).toBeDefined();
    expect(speckleUser).toBeNull();
  });
});
