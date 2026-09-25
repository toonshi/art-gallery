'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {TextArea} from '@astryxdesign/core/TextArea';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Banner} from '@astryxdesign/core/Banner';
import {useToast} from '@astryxdesign/core/Toast';
import {updateOrderNotes, updateOrderStatus, type ActionResult} from '@/lib/admin/actions';
import type {Order} from '@/lib/types';

const next: Partial<Record<Order['status'], {status: 'shipped' | 'delivered'; label: string}>> = {
  paid: {status: 'shipped', label: 'Mark as sent'},
  shipped: {status: 'delivered', label: 'Mark as delivered'},
};

export function OrderActions({order}: {order: Order}) {
  const router = useRouter();
  const toast = useToast();
  const [notes, setNotes] = useState(order.notes);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handle(result: ActionResult, message: string) {
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setError(null);
    toast({body: message});
    router.refresh();
    return true;
  }

  const step = next[order.status];
  const canCancel = ['paid', 'shipped'].includes(order.status);

  return (
    <VStack gap={4}>
      {error ? <Banner status="error" title={error} /> : null}
      {step || canCancel ? (
        <HStack gap={2} wrap="wrap">
          {step ? (
            <Button
              label={step.label}
              variant="primary"
              clickAction={async () =>
                void handle(await updateOrderStatus(order.id, step.status), `Order ${step.status === 'shipped' ? 'marked as sent' : 'marked as delivered'}`)
              }
            />
          ) : null}
          {canCancel ? (
            <Button label="Cancel order" variant="ghost" onClick={() => setIsCancelOpen(true)} />
          ) : null}
        </HStack>
      ) : null}
      <TextArea
        label="Private notes"
        description="Delivery arrangements, framing requests — only visible to you."
        rows={4}
        value={notes}
        onChange={setNotes}
      />
      <HStack>
        <Button
          label="Save notes"
          isDisabled={notes === order.notes}
          clickAction={async () => void handle(await updateOrderNotes(order.id, notes), 'Notes saved')}
        />
      </HStack>
      <AlertDialog
        isOpen={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        title={`Cancel order ${order.reference}?`}
        description="The artwork goes back on sale in the shop. This doesn't refund the buyer: do that from the Stripe dashboard."
        actionLabel="Cancel order"
        cancelLabel="Keep order"
        isActionLoading={isCancelling}
        onAction={async () => {
          setIsCancelling(true);
          const ok = handle(await updateOrderStatus(order.id, 'cancelled', {relist: true}), 'Order cancelled');
          setIsCancelling(false);
          if (ok) setIsCancelOpen(false);
        }}
      />
    </VStack>
  );
}
