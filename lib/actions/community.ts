'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { CommunityPoll, PollChoice } from '@/lib/types';

/**
 * Fetch all community polls with creator profile info.
 * Returns polls ordered by most recent.
 */
export async function getPolls(): Promise<{
  polls: CommunityPoll[];
  userVotes: Record<string, PollChoice>;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: polls, error } = await supabase
    .from('community_polls')
    .select(`
      *,
      profiles (full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('getPolls error:', error);
    return { polls: [], userVotes: {}, error: error.message };
  }

  // Get the current user's votes if authenticated
  let userVotes: Record<string, PollChoice> = {};
  if (user && polls && polls.length > 0) {
    const pollIds = polls.map((p: CommunityPoll) => p.id);
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('poll_id, choice')
      .eq('user_id', user.id)
      .in('poll_id', pollIds);

    if (votes) {
      userVotes = Object.fromEntries(
        votes.map((v: { poll_id: string; choice: PollChoice }) => [v.poll_id, v.choice])
      );
    }
  }

  return { polls: (polls as CommunityPoll[]) ?? [], userVotes };
}

/**
 * Cast a vote on a poll using the atomic Postgres function.
 * Returns the updated poll vote counts.
 */
export async function castVote(
  pollId: string,
  choice: PollChoice
): Promise<{
  success: boolean;
  votesA?: number;
  votesB?: number;
  error?: string;
  alreadyVoted?: boolean;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  // Call the atomic Postgres function
  const { data, error } = await supabase.rpc('cast_poll_vote', {
    p_poll_id: pollId,
    p_user_id: user.id,
    p_choice: choice,
  });

  if (error) {
    console.error('castVote error:', error);
    return { success: false, error: error.message };
  }

  const result = data as { success: boolean; message: string; existing_choice?: string };

  if (!result.success) {
    return { success: false, alreadyVoted: true, error: result.message };
  }

  // Fetch updated vote counts
  const { data: poll } = await supabase
    .from('community_polls')
    .select('votes_a, votes_b')
    .eq('id', pollId)
    .single();

  revalidatePath('/community');

  return {
    success: true,
    votesA: poll?.votes_a ?? 0,
    votesB: poll?.votes_b ?? 0,
  };
}

/**
 * Create a new community poll with two outfit images.
 */
export async function createPoll(formData: FormData): Promise<{
  success: boolean;
  pollId?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const question = formData.get('question') as string | null;
  const occasion = formData.get('occasion') as string | null;
  const imageA = formData.get('imageA') as File | null;
  const imageB = formData.get('imageB') as File | null;

  if (!question || !imageA || !imageB) {
    return { success: false, error: 'Question and both outfit images are required' };
  }

  try {
    // Upload both images in parallel
    const uploadImage = async (file: File, label: 'a' | 'b'): Promise<string> => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${user.id}/polls/${Date.now()}_${label}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('wardrobe')
        .upload(fileName, buffer, { contentType: file.type });

      if (error) throw new Error(error.message);

      const { data: signedUrl } = await supabase.storage
        .from('wardrobe')
        .createSignedUrl(data.path, 31536000);

      return signedUrl?.signedUrl ?? data.path;
    };

    const [imageAUrl, imageBUrl] = await Promise.all([
      uploadImage(imageA, 'a'),
      uploadImage(imageB, 'b'),
    ]);

    const { data: poll, error: dbError } = await supabase
      .from('community_polls')
      .insert({
        user_id: user.id,
        question,
        image_a_url: imageAUrl,
        image_b_url: imageBUrl,
        occasion: occasion || null,
      })
      .select('id')
      .single();

    if (dbError) throw new Error(dbError.message);

    revalidatePath('/community');

    return { success: true, pollId: poll.id };
  } catch (error) {
    console.error('createPoll error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create poll',
    };
  }
}
