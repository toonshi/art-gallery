'use client';

/*
 * Icons for Server Components: lucide icons are functions, which can't be
 * passed across the server/client boundary to Astryx's <Icon>.
 */
import {Icon} from '@astryxdesign/core/Icon';
import {CircleCheck, ImageIcon} from 'lucide-react';

export function SuccessIcon() {
  return <Icon icon={CircleCheck} size="lg" color="success" />;
}

export function NoImageIcon() {
  return <Icon icon={ImageIcon} size="lg" color="secondary" label="No photo yet" />;
}
