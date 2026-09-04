'use server';

import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

/**
 * Fetch the current user's profile along with wardrobe item count.
 */
export async function getProfile(): Promise<{
  profile: Profile | null;
  wardrobeCount: number;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { profile: null, wardrobeCount: 0, error: 'Not authenticated' };

  const [profileResult, countResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('wardrobe_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  if (profileResult.error) {
    console.error('getProfile error:', profileResult.error);
    return { profile: null, wardrobeCount: 0, error: profileResult.error.message };
  }

  return {
    profile: profileResult.data as Profile,
    wardrobeCount: countResult.count ?? 0,
  };
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'gender_preference' | 'budget_tier'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('updateProfile error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
