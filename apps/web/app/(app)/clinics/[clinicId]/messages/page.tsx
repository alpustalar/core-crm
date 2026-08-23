import { Suspense } from 'react';

import { Inbox } from '@/features/messaging/components/inbox';

export const metadata = {
  title: 'Mesajlar — Core CRM',
};

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ clinicId: string }>;
}) {
  const { clinicId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Mesajlar</h1>
        <p className="text-muted-foreground text-sm">
          WhatsApp, Telegram ve Instagram yazışmaları tek gelen kutusunda.
        </p>
      </div>

      <Suspense>
        <Inbox clinicId={clinicId} />
      </Suspense>
    </div>
  );
}
