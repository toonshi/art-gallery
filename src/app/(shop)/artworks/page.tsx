import type {Metadata} from 'next';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {getPublishedArtworks} from '@/lib/data';
import {ArtworkBrowser} from '@/components/ArtworkBrowser';

export const metadata: Metadata = {title: 'Artworks'};
export const revalidate = 60;

export default async function ArtworksPage() {
  const artworks = await getPublishedArtworks();
  return (
    <VStack gap={6}>
      <VStack gap={1}>
        <Heading level={1}>Artworks</Heading>
        <Text color="secondary">
          Each piece is an original — once it sells, it&apos;s gone.
        </Text>
      </VStack>
      <ArtworkBrowser artworks={artworks} />
    </VStack>
  );
}
