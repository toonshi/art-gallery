import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {formatKes} from '@/lib/format';
import type {Artwork} from '@/lib/types';
import {ArtworkImage} from './ArtworkImage';
import {ArtworkStatus} from './ArtworkStatus';

export function ArtworkCard({artwork}: {artwork: Artwork}) {
  return (
    <ClickableCard
      href={`/artworks/${artwork.slug}`}
      label={artwork.title}
      variant="transparent"
      padding={0}>
      <VStack gap={3}>
        <ArtworkImage path={artwork.images[0]} alt={artwork.title} />
        <VStack gap={1}>
          <Text weight="semibold" maxLines={1}>
            {artwork.title}
          </Text>
          <Text color="secondary" maxLines={1}>
            {[artwork.medium, artwork.dimensions].filter(Boolean).join(' · ')}
          </Text>
          <HStack gap={3} vAlign="center" justify="between">
            {artwork.status === 'sold' ? (
              <Text color="secondary" hasStrikethrough>
                {formatKes(artwork.price_kes)}
              </Text>
            ) : (
              <Text weight="medium" hasTabularNumbers>
                {formatKes(artwork.price_kes)}
              </Text>
            )}
            <ArtworkStatus status={artwork.status} />
          </HStack>
        </VStack>
      </VStack>
    </ClickableCard>
  );
}
