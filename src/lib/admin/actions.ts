'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {getAdminSession} from '../data';
import {slugify} from '../format';
import {createSupabaseServerClient} from '../supabase/server';

export type ActionResult = {ok: true; id?: string} | {ok: false; error: string};

async function requireAdmin(): Promise<ActionResult | null> {
  const session = await getAdminSession();
  if (session.kind === 'demo') {
    return {ok: false, error: 'Demo mode: connect Supabase to save changes (see README).'};
  }
  if (session.kind !== 'admin') return {ok: false, error: 'You are not signed in as an admin.'};
  return null;
}

function refreshShop(slug?: string) {
  revalidatePath('/');
  revalidatePath('/artworks');
  if (slug) revalidatePath(`/artworks/${slug}`);
  revalidatePath('/admin', 'layout');
}

// ─── Artworks ─────────────────────────────────────────────────────────────

const artworkInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, 'Give the piece a title.').max(200),
  slug: z.string().trim().max(80).optional(),
  description: z.string().max(5000),
  medium: z.string().trim().max(120),
  dimensions: z.string().trim().max(120),
  year: z.number().int().min(1900).max(2100).nullable(),
  price_kes: z.number().int().positive('Set a price above zero.'),
  status: z.enum(['available', 'reserved', 'sold']),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  images: z.array(z.string().min(1)).max(12),
});

export type ArtworkInput = z.infer<typeof artworkInput>;

export async function saveArtwork(input: ArtworkInput): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = artworkInput.safeParse(input);
  if (!parsed.success) return {ok: false, error: parsed.error.issues[0].message};

  const {id, ...fields} = parsed.data;
  const slug = slugify(fields.slug || fields.title) || `artwork-${Date.now()}`;
  const row = {
    ...fields,
    slug,
    // A manual status change clears any checkout hold.
    ...(fields.status !== 'reserved' ? {reserved_until: null, reserved_order_id: null} : {}),
  };

  const supabase = await createSupabaseServerClient();
  const query = id
    ? supabase.from('artworks').update(row).eq('id', id).select('id').single()
    : supabase.from('artworks').insert(row).select('id').single();
  const {data, error} = await query;
  if (error) {
    return {
      ok: false,
      error:
        error.code === '23505'
          ? 'Another artwork already uses that web address (slug). Change the title or slug.'
          : error.message,
    };
  }
  refreshShop(slug);
  return {ok: true, id: data.id};
}

export async function deleteArtwork(id: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const supabase = await createSupabaseServerClient();
  const {data: artwork, error} = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)
    .select('slug, images')
    .maybeSingle();
  if (error) return {ok: false, error: error.message};
  const stored = (artwork?.images ?? []).filter((p: string) => !/^(https?:|data:)/.test(p));
  if (stored.length) await supabase.storage.from('artworks').remove(stored);
  refreshShop(artwork?.slug);
  return {ok: true};
}

// ─── Orders ───────────────────────────────────────────────────────────────

const orderStatus = z.enum(['paid', 'shipped', 'delivered', 'cancelled']);

export async function updateOrderStatus(
  id: string,
  status: z.infer<typeof orderStatus>,
  options: {relist?: boolean} = {},
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!orderStatus.safeParse(status).success) return {ok: false, error: 'Unknown status.'};

  const supabase = await createSupabaseServerClient();
  const {data: order, error} = await supabase
    .from('orders')
    .update({status})
    .eq('id', id)
    .select('artwork_id')
    .single();
  if (error) return {ok: false, error: error.message};

  if (status === 'cancelled' && options.relist && order.artwork_id) {
    await supabase
      .from('artworks')
      .update({status: 'available', reserved_until: null, reserved_order_id: null})
      .eq('id', order.artwork_id);
  }
  refreshShop();
  return {ok: true};
}

export async function updateOrderNotes(id: string, notes: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const supabase = await createSupabaseServerClient();
  const {error} = await supabase
    .from('orders')
    .update({notes: notes.slice(0, 5000)})
    .eq('id', id);
  if (error) return {ok: false, error: error.message};
  revalidatePath('/admin', 'layout');
  return {ok: true};
}

// ─── Session ──────────────────────────────────────────────────────────────

export async function signOut() {
  const session = await getAdminSession();
  if (session.kind !== 'demo') {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect('/admin/login');
}
