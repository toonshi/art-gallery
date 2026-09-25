import type {ReactNode} from 'react';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <HStack gap={4} justify="between" vAlign="end" wrap="wrap">
      <VStack gap={1}>
        {eyebrow}
        <Heading level={1}>{title}</Heading>
        {description ? <Text color="secondary">{description}</Text> : null}
      </VStack>
      {actions ? <HStack gap={2}>{actions}</HStack> : null}
    </HStack>
  );
}
