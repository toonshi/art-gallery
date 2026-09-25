import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {List, ListItem} from '@astryxdesign/core/List';
import {Banner} from '@astryxdesign/core/Banner';
import {Divider} from '@astryxdesign/core/Divider';
import {deliveryOptions} from '@/lib/config';
import {getArtworkBySlug} from '@/lib/data';
import {formatKes} from '@/lib/format';
import {imageUrl} from '@/lib/images';
import {ArtworkGallery} from '@/components/ArtworkGallery';
import {ArtworkStatus} from '@/components/ArtworkStatus';
import {BuyButton} from '@/components/BuyButton';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{slug: string}>;
  searchParams: Promise<{cancelled?: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const artwork = await getArtworkBySlug((await params).slug);
  if (!artwork) return {};
  const cover = imageUrl(artwork.images[0]);
  return {
    title: artwork.title,
    description: artwork.description.slice(0, 160),
    openGraph: cover && !cover.startsWith('data:') ? {images: [cover]} : undefined,
  };
}

export default async function ArtworkPage({params, searchParams}: Props) {
  const [{slug}, {cancelled}] = await Promise.all([params, searchParams]);
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const isReserved =
    artwork.status === 'reserved' &&
    artwork.reserved_until !== null &&
    new Date(artwork.reserved_until) > new Date();
  const canBuy = artwork.status === 'available' || (artwork.status === 'reserved' && !isReserved);

  return (
    <VStack gap={6}>
      <Breadcrumbs>
        <BreadcrumbItem href="/artworks">Artworks</BreadcrumbItem>
        <BreadcrumbItem isCurrent>{artwork.title}</BreadcrumbItem>
      </Breadcrumbs>

      <Grid columns={{minWidth: 320, repeat: 'fit'}} gap={10} align="start">
        <ArtworkGallery title={artwork.title} images={artwork.images} />

        <VStack gap={6}>
          <VStack gap={2}>
            <Heading level={1}>{artwork.title}</Heading>
            <Text color="secondary">
              {[artwork.medium, artwork.year].filter(Boolean).join(', ')}
            </Text>
          </VStack>

          <HStack gap={4} vAlign="center" justify="between">
            <Text type="display-3" hasTabularNumbers hasStrikethrough={artwork.status === 'sold'}>
              {formatKes(artwork.price_kes)}
            </Text>
            <ArtworkStatus status={canBuy ? 'available' : artwork.status} />
          </HStack>

          {cancelled ? (
            <Banner
              status="info"
              title="Checkout cancelled"
              description="You haven't been charged. The piece is still available if you change your mind."
            />
          ) : null}

          {canBuy ? (
            <BuyButton artworkId={artwork.id} />
          ) : isReserved ? (
            <Banner
              status="warning"
              title="Someone is checking out with this piece"
              description="If they don't complete payment it will be available again within 30 minutes."
            />
          ) : (
            <Banner
              status="info"
              title="This original has been sold"
              description="Browse the other available works, or get in touch about similar pieces."
            />
          )}

          <MetadataList>
            <MetadataListItem label="Medium">{artwork.medium || '—'}</MetadataListItem>
            <MetadataListItem label="Size">{artwork.dimensions || '—'}</MetadataListItem>
            <MetadataListItem label="Year">{artwork.year ?? '—'}</MetadataListItem>
            <MetadataListItem label="Edition">Original, one of one</MetadataListItem>
          </MetadataList>

          {artwork.description ? (
            <VStack gap={2}>
              <Heading level={2}>About this piece</Heading>
              {artwork.description.split(/\n{2,}/).map((para, i) => (
                <Text key={i} as="p">
                  {para}
                </Text>
              ))}
            </VStack>
          ) : null}

          <Divider />

          <List header={<Heading level={2}>Delivery</Heading>} hasDividers>
            {deliveryOptions.map(option => (
              <ListItem
                key={option.id}
                label={option.label}
                description={`${option.minDays}–${option.maxDays} working days`}
                endContent={
                  <Text hasTabularNumbers>
                    {option.feeKes === 0 ? 'Free' : formatKes(option.feeKes)}
                  </Text>
                }
              />
            ))}
          </List>
        </VStack>
      </Grid>
    </VStack>
  );
}
