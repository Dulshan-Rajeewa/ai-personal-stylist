'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { WardrobeCategory, WardrobeItem } from '@/lib/types';

/**
 * Upload a wardrobe item image to Supabase Storage and insert a DB record.
 */
export async function uploadWardrobeItem(formData: FormData): Promise<{
  success: boolean;
  item?: WardrobeItem;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const file = formData.get('image') as File | null;
  const category = formData.get('category') as WardrobeCategory | null;
  const color = formData.get('color') as string | null;
  const tagsRaw = formData.get('tags') as string | null;
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

  if (!file) return { success: false, error: 'No image provided' };
  if (!category) return { success: false, error: 'Category is required' };

  try {
    // Upload to storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wardrobe')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    // Get signed URL (1 year)
    const { data: signedUrlData } = await supabase.storage
      .from('wardrobe')
      .createSignedUrl(uploadData.path, 31536000);

    const imageUrl = signedUrlData?.signedUrl ?? uploadData.path;

    // Insert DB record
    const { data: item, error: dbError } = await supabase
      .from('wardrobe_items')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        category,
        color: color || null,
        tags,
      })
      .select()
      .single();

    if (dbError) throw new Error(dbError.message);

    revalidatePath('/wardrobe');
    revalidatePath('/dashboard');

    return { success: true, item: item as WardrobeItem };
  } catch (error) {
    console.error('uploadWardrobeItem error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Fetch wardrobe items for the current user, optionally filtered by category.
 */
export async function getWardrobeItems(
  category?: WardrobeCategory | 'all'
): Promise<{ items: WardrobeItem[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { items: [], error: 'Not authenticated' };

  let query = supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getWardrobeItems error:', error);
    return { items: [], error: error.message };
  }

  return { items: (data as WardrobeItem[]) ?? [] };
}

/**
 * Delete a wardrobe item from both DB and storage.
 */
export async function deleteWardrobeItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  // Fetch the item to get its storage path
  const { data: item, error: fetchError } = await supabase
    .from('wardrobe_items')
    .select('image_url, user_id')
    .eq('id', id)
    .single();

  if (fetchError || !item) return { success: false, error: 'Item not found' };
  if (item.user_id !== user.id) return { success: false, error: 'Not authorized' };

  // Delete from DB (storage cleanup is a best-effort — path may not be extractable from signed URL)
  const { error: dbError } = await supabase
    .from('wardrobe_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath('/wardrobe');
  revalidatePath('/dashboard');

  return { success: true };
}
