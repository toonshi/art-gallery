'use client';

import {useState, type CSSProperties} from 'react';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Maximize2} from 'lucide-react';
import {imageUrl} from '@/lib/images';
import {ArtworkImage} from './ArtworkImage';

// The painting is shown whole (never cropped) on a muted mat.
const mat: CSSProperties = {
  borderRadius: 'var(--radius-container)',
  backgroundColor: 'var(--color-background-muted)',
  cursor: 'zoom-in',
};

export function ArtworkGallery({title, images}: {title: string; images: string[]}) {
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const urls = images.map(p => imageUrl(p)).filter((u): u is string => Boolean(u));

  if (urls.length === 0) return <ArtworkImage path={undefined} alt={title} />;

  return (
    <VStack gap={3}>
      <AspectRatio ratio={4 / 5} fit="contain">
        <img
          src={urls[index]}
          alt={`${title}${urls.length > 1 ? ` — view ${index + 1}` : ''}`}
          style={mat}
          onClick={() => setIsOpen(true)}
        />
      </AspectRatio>
      <HStack gap={2} justify="between" vAlign="center">
        <HStack gap={2} wrap="wrap">
          {urls.length > 1
            ? urls.map((url, i) => (
                <Thumbnail
                  key={url}
                  src={url}
                  alt={`${title} — view ${i + 1}`}
                  label={`View ${i + 1}`}
                  onClick={() => setIndex(i)}
                />
              ))
            : null}
        </HStack>
        <Button
          label="View larger"
          variant="ghost"
          icon={<Icon icon={Maximize2} size="sm" />}
          onClick={() => setIsOpen(true)}
        />
      </HStack>
      <Lightbox
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        media={urls.map((src, i) => ({src, alt: `${title} — view ${i + 1}`}))}
        index={index}
        onIndexChange={setIndex}
        hasZoom
      />
    </VStack>
  );
}
