import 'server-only';
import {cache} from 'react';
import {isSupabaseConfigured} from './env';
import {demoArtworks, demoOrders} from './demo';
import {createSupabaseServerClient} from './supabase/server';
import type {Artwork, Order} from './types';

/*
 * All reads go through here. Queries run as the current visitor, so row level
 * security decides what they can see: shoppers get published artworks,
 * admins get everything.
 */

export async function getPublishedArtworks(): Promise<Artwork[]> {
  if (!isSupabaseConfigured()) return demoArtworks.filter(a => a.is_published);
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('artworks')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', {ascending: false})
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data as Artwork[];
}

export const getArtworkBySlug = cache(async (slug: string): Promise<Artwork | null> => {
  if (!isSupabaseConfigured()) {
    return demoArtworks.find(a => a.slug === slug && a.is_published) ?? null;
  }
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('artworks')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data as Artwork | null;
});

// ─── Admin ────────────────────────────────────────────────────────────────

export type AdminSession =
  | {kind: 'demo'}
  | {kind: 'admin'; email: string}
  | {kind: 'forbidden'; email: string}
  | {kind: 'signed-out'};

export const getAdminSession = cache(async (): Promise<AdminSession> => {
  if (!isSupabaseConfigured()) return {kind: 'demo'};
  const supabase = await createSupabaseServerClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) return {kind: 'signed-out'};
  const {data: isAdmin} = await supabase.rpc('is_admin');
  const email = user.email ?? '';
  return isAdmin ? {kind: 'admin', email} : {kind: 'forbidden', email};
});

export async function getAllArtworks(): Promise<Artwork[]> {
  if (!isSupabaseConfigured()) return demoArtworks;
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data as Artwork[];
}

export async function getArtworkById(id: string): Promise<Artwork | null> {
  if (!isSupabaseConfigured()) return demoArtworks.find(a => a.id === id) ?? null;
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase.from('artworks').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Artwork | null;
}

export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return demoOrders;
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('orders')
    .select('*')
    .order('created_at', {ascending: false})
    .limit(500);
  if (error) throw error;
  return data as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return demoOrders.find(o => o.id === id) ?? null;
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}
