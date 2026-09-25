import {Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {getAllArtworks} from '@/lib/data';
import {ArtworksTable} from '@/components/admin/ArtworksTable';
import {PageHeader} from '@/components/admin/PageHeader';

export default async function AdminArtworksPage() {
  const artworks = await getAllArtworks();
  const forSale = artworks.filter(a => a.is_published && a.status === 'available').length;
  const addButton = <Button label="Add artwork" variant="primary" href="/admin/artworks/new" />;
  return (
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <PageHeader
              title="Artworks"
              description={`${artworks.length} in the catalogue · ${forSale} for sale now`}
              actions={addButton}
            />
            <Card>
              {artworks.length ? (
                <ArtworksTable artworks={artworks} />
              ) : (
                <EmptyState
                  title="No artworks yet"
                  description="Add your first piece with a few photos, a price and a short description."
                  actions={addButton}
                />
              )}
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
