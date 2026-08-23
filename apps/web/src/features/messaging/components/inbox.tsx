'use client';

import type { ConversationStatusValue } from '@core-crm/shared/client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/lib/api';

import { useConversations } from '../api/use-conversations';
import { useInboxParams } from '../hooks/use-inbox-params';
import { CONVERSATION_STATUS_LABELS } from '../messaging.labels';
import { ConversationList } from './conversation-list';
import { ConversationPanel } from './conversation-panel';

const ALL = '__all__';

export function Inbox({ clinicId }: { clinicId: string }) {
  const { filter, pagination, conversationId, setParam } = useInboxParams();
  const { data, isPending, error } = useConversations({
    clinicId,
    filter,
    pagination,
  });

  const conversations = data?.data ?? [];
  const active = conversations.find((item) => item.id === conversationId);

  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error instanceof ApiError ? error.message : 'Gelen kutusu yüklenemedi.'}
      </p>
    );
  }

  const totalPages = data?.pagination?.totalPages ?? 1;
  const currentPage = data?.pagination?.page ?? 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filter.status ?? ALL}
          onValueChange={(value) =>
            setParam('status', value === ALL ? undefined : value)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm durumlar</SelectItem>
            {(
              Object.keys(
                CONVERSATION_STATUS_LABELS
              ) as ConversationStatusValue[]
            ).map((status) => (
              <SelectItem key={status} value={status}>
                {CONVERSATION_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid min-h-[32rem] grid-cols-1 gap-0 rounded-lg border md:grid-cols-[20rem_1fr]">
        <div className="flex min-h-0 flex-col border-b md:border-r md:border-b-0">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              isLoading={isPending}
              activeId={conversationId}
              onSelect={(id) => setParam('conversationId', id)}
            />
          </div>

          {/*
            Konuşma listesi DataTable kullanmıyor: bu bir tablo değil, seçim
            listesi. Sayfalama yine sunucuda, o yüzden basit ileri/geri yeterli.
          */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 border-t p-2 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setParam('page', String(currentPage - 1))}
              >
                Önceki
              </Button>
              <span className="text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setParam('page', String(currentPage + 1))}
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>

        <div className="min-h-0">
          {active ? (
            <ConversationPanel clinicId={clinicId} conversation={active} />
          ) : (
            <p className="text-muted-foreground p-6 text-sm">
              Soldan bir yazışma seçin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
