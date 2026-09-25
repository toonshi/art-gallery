import {notFound} from 'next/navigation';
import {isSupabaseConfigured} from '@/lib/env';
import {getArtworkById} from '@/lib/data';
import {ArtworkForm} from '@/components/admin/ArtworkForm';

export default async function EditArtworkPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const artwork = await getArtworkById(id).catch(() => null);
  if (!artwork) notFound();
  return <ArtworkForm key={artwork.updated_at} artwork={artwork} isDemo={!isSupabaseConfigured()} />;
}
