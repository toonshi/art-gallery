import type {CSSProperties} from 'react';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Center} from '@astryxdesign/core/Center';
import {NoImageIcon} from './icons';
import {imageUrl} from '@/lib/images';

// AspectRatio has no radius prop, so the image rounds itself with the
// container radius token.
const rounded: CSSProperties = {borderRadius: 'var(--radius-container)'};
const muted: CSSProperties = {
  ...rounded,
  backgroundColor: 'var(--color-background-muted)',
};

export function ArtworkImage({
  path,
  alt,
  ratio = 4 / 5,
  fit = 'cover',
}: {
  path: string | undefined;
  alt: string;
  ratio?: number;
  fit?: 'cover' | 'contain';
}) {
  const src = imageUrl(path);
  return (
    <AspectRatio ratio={ratio} fit={fit}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" style={fit === 'contain' ? undefined : rounded} />
      ) : (
        <Center style={muted}>
          <NoImageIcon />
        </Center>
      )}
    </AspectRatio>
  );
}
