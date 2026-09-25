'use client';

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Banner} from '@astryxdesign/core/Banner';

export function BuyButton({artworkId}: {artworkId: string}) {
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({artworkId}),
      });
      const body = (await res.json().catch(() => ({}))) as {url?: string; error?: string};
      if (!res.ok || !body.url) {
        setError(body.error ?? 'Something went wrong starting checkout. Please try again.');
        return;
      }
      window.location.assign(body.url);
      // Keep the spinner while the browser leaves for Stripe.
      await new Promise(() => {});
    } catch {
      setError('Could not reach the shop. Check your connection and try again.');
    }
  }

  return (
    <VStack gap={3} hAlign="stretch">
      <Button label="Buy now" variant="primary" size="lg" clickAction={buy} />
      {error ? <Banner status="error" title={error} /> : null}
    </VStack>
  );
}
