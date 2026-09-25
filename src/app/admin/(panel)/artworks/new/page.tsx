import {isSupabaseConfigured} from '@/lib/env';
import {ArtworkForm} from '@/components/admin/ArtworkForm';

export default function NewArtworkPage() {
  return <ArtworkForm isDemo={!isSupabaseConfigured()} />;
}
