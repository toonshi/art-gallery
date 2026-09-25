import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {site} from '@/lib/config';
import {getPublishedArtworks} from '@/lib/data';
import {ArtworkCard} from '@/components/ArtworkCard';

export const revalidate = 60;

export default async function HomePage() {
  const artworks = await getPublishedArtworks();
  const available = artworks.filter(a => a.status !== 'sold');
  const featured = (artworks.some(a => a.is_featured)
    ? artworks.filter(a => a.is_featured)
    : available
  ).slice(0, 6);

  return (
    <VStack gap={10}>
      <VStack gap={5} hAlign="center" paddingBlock={10}>
        <VStack gap={3} hAlign="center">
          <Heading level={1} type="display-2" justify="center" textWrap="balance">
            {site.tagline}
          </Heading>
          <Text size="lg" color="secondary" justify="center" textWrap="balance">
            {site.intro}
          </Text>
        </VStack>
        <HStack gap={3}>
          <Button label="Browse the collection" variant="primary" size="lg" href="/artworks" />
        </HStack>
      </VStack>

      {featured.length > 0 ? (
        <VStack gap={5}>
          <Divider />
          <HStack gap={4} justify="between" vAlign="center" wrap="wrap">
            <VStack gap={1}>
              <Heading level={2}>Featured works</Heading>
              <Text color="secondary">
                {available.length} {available.length === 1 ? 'original' : 'originals'} available now
              </Text>
            </VStack>
            <Button label="See all artworks" variant="ghost" href="/artworks" />
          </HStack>
          <Grid columns={{minWidth: 260, repeat: 'fill'}} gap={6}>
            {featured.map(artwork => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </Grid>
        </VStack>
      ) : null}
    </VStack>
  );
}
