'use client';

import {useMemo, useState} from 'react';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import type {Artwork} from '@/lib/types';
import {ArtworkCard} from './ArtworkCard';

const ALL = 'all';

export function ArtworkBrowser({artworks}: {artworks: Artwork[]}) {
  const [availability, setAvailability] = useState<'available' | 'all' | 'sold'>('available');
  const [medium, setMedium] = useState(ALL);

  const mediums = useMemo(
    () => Array.from(new Set(artworks.map(a => a.medium).filter(Boolean))).sort(),
    [artworks],
  );

  const visible = artworks.filter(a => {
    if (availability === 'available' && a.status === 'sold') return false;
    if (availability === 'sold' && a.status !== 'sold') return false;
    return medium === ALL || a.medium === medium;
  });

  return (
    <VStack gap={6}>
      <HStack gap={4} justify="between" vAlign="end" wrap="wrap">
        <SegmentedControl
          label="Availability"
          value={availability}
          onChange={v => setAvailability(v as typeof availability)}>
          <SegmentedControlItem value="available" label="Available" />
          <SegmentedControlItem value="all" label="All work" />
          <SegmentedControlItem value="sold" label="Sold" />
        </SegmentedControl>
        {mediums.length > 1 ? (
          <Selector
            label="Medium"
            isLabelHidden
            width={240}
            value={medium}
            onChange={setMedium}
            options={[{value: ALL, label: 'All mediums'}, ...mediums.map(m => ({value: m, label: m}))]}
          />
        ) : null}
      </HStack>
      <Text color="secondary">
        {visible.length} {visible.length === 1 ? 'work' : 'works'}
      </Text>
      {visible.length > 0 ? (
        <Grid columns={{minWidth: 260, repeat: 'fill'}} gap={6}>
          {visible.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="Nothing here yet"
          description="Try a different filter, or check back soon — new work is added regularly."
        />
      )}
    </VStack>
  );
}
