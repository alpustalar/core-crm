import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MarkConversationReadHandler } from './mark-conversation-read.handler';
import { MarkConversationReadCommand } from './mark-conversation-read.command';
import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { IConversationCommandRepository } from '@modules/conversation/domain/repositories/conversation.repository';
import { IMessageQueryRepository } from '@modules/conversation/domain/repositories/message.repository';
import { MessageChannelPort } from '@modules/conversation/domain/ports/message-channel.port';
import { MessageChannel } from '@shared';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';

describe('MarkConversationReadHandler', () => {
  const ctx = { actor: { userId: 'u1' } } as never;

  const conversation = () => {
    const c = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    c.recordInboundMessage({ messageId: 'm-1', body: 'merhaba' });
    return c;
  };

  const build = (params: {
    conversation: Conversation | null;
    latestExternalId?: string | null;
    markReadImpl?: jest.Mock;
    onTxEnd?: () => void;
  }) => {
    let saved: Conversation | undefined;

    // Okuma kilitli ve command repo'dan: sayaç sıfırlaması gelen mesajın artırımıyla yarışır.
    const conversationCommandRepo = {
      findByIdForUpdate: jest.fn().mockResolvedValue(params.conversation),
      update: jest.fn(async (c: Conversation) => {
        saved = c;
        return c;
      }),
    } as unknown as IConversationCommandRepository;

    const messageQueryRepo = {
      findLatestInboundExternalId: jest
        .fn()
        .mockResolvedValue(params.latestExternalId ?? null),
    } as unknown as IMessageQueryRepository;

    const channel = {
      send: jest.fn(),
      markRead: params.markReadImpl ?? jest.fn().mockResolvedValue(undefined),
    } as unknown as MessageChannelPort;

    const txManager = {
      run: jest.fn(async (cb: () => Promise<unknown>) => {
        const result = await cb();
        params.onTxEnd?.();
        return result;
      }),
    } as unknown as MongoTransactionManager;

    const handler = new MarkConversationReadHandler(
      conversationCommandRepo,
      messageQueryRepo,
      channel,
      txManager
    );
    return { handler, channel, txManager, getSaved: () => saved };
  };

  it('okundu işareti gönderir + unreadCount sıfırlanır', async () => {
    const { handler, channel, getSaved } = build({
      conversation: conversation(),
      latestExternalId: 'wamid.in.1',
    });

    await handler.execute(
      new MarkConversationReadCommand({
        clinicId: 'clinic-1',
        conversationId: 'conv-1',
        ctx,
      })
    );

    expect(channel.markRead).toHaveBeenCalledWith(
      MessageChannel.WHATSAPP,
      'clinic-1',
      'wamid.in.1'
    );
    expect(getSaved()!.unreadCount).toBe(0);
    expect(getSaved()!.agentReadAt).toBeInstanceOf(Date);
  });

  it('gelen mesaj yoksa markRead çağrılmaz ama sayaç yine sıfırlanır', async () => {
    const { handler, channel, getSaved } = build({
      conversation: conversation(),
      latestExternalId: null,
    });

    await handler.execute(
      new MarkConversationReadCommand({
        clinicId: 'clinic-1',
        conversationId: 'conv-1',
        ctx,
      })
    );

    expect(channel.markRead).not.toHaveBeenCalled();
    expect(getSaved()!.unreadCount).toBe(0);
  });

  it('markRead başarısız olsa bile sayaç sıfırlanır (best-effort)', async () => {
    const { handler, getSaved } = build({
      conversation: conversation(),
      latestExternalId: 'wamid.in.1',
      markReadImpl: jest.fn().mockRejectedValue(new Error('meta down')),
    });

    await handler.execute(
      new MarkConversationReadCommand({
        clinicId: 'clinic-1',
        conversationId: 'conv-1',
        ctx,
      })
    );

    expect(getSaved()!.unreadCount).toBe(0);
  });

  it('kanal çağrısı transaction DIŞINDA yapılır (uzak servis DB kilidini tutmaz)', async () => {
    const order: string[] = [];
    const { handler } = build({
      conversation: conversation(),
      latestExternalId: 'wamid.in.1',
      markReadImpl: jest.fn(async () => {
        order.push('markRead');
      }),
      onTxEnd: () => order.push('tx-bitti'),
    });

    await handler.execute(
      new MarkConversationReadCommand({
        clinicId: 'clinic-1',
        conversationId: 'conv-1',
        ctx,
      })
    );

    expect(order).toEqual(['tx-bitti', 'markRead']);
  });

  it('yazışma yoksa NotFoundException', async () => {
    const { handler } = build({ conversation: null });
    await expect(
      handler.execute(
        new MarkConversationReadCommand({
          clinicId: 'clinic-1',
          conversationId: 'conv-x',
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('başka kliniğe aitse ForbiddenException', async () => {
    const { handler } = build({ conversation: conversation() });
    await expect(
      handler.execute(
        new MarkConversationReadCommand({
          clinicId: 'clinic-OTHER',
          conversationId: 'conv-1',
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
