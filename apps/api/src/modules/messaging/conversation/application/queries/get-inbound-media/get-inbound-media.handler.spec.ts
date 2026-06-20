import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetInboundMediaHandler } from './get-inbound-media.handler';
import { GetInboundMediaQuery } from './get-inbound-media.query';
import { FetchWhatsappMediaQuery } from '@modules/messaging/channel-config/application/queries/fetch-whatsapp-media/fetch-whatsapp-media.query';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { toWhatsappMediaRef } from '@modules/messaging/conversation/domain/media-reference';
import { IConversationQueryRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { IMessageQueryRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { MessageType } from '@prisma/client';

describe('GetInboundMediaHandler (proxy önizleme — saklama yok)', () => {
  const ctx = { actor: { userId: 'u1' } } as never;

  const conversation = () =>
    Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });

  const build = (params: {
    message: Message | null;
    conversation?: Conversation | null;
    fetched?: { content: Buffer; mimeType: string } | null;
  }) => {
    const messageQueryRepo = {
      findById: jest.fn().mockResolvedValue(params.message),
      findByExternalId: jest.fn(),
      findManyByConversation: jest.fn(),
    } as unknown as IMessageQueryRepository;

    const conversationQueryRepo = {
      findById: jest.fn().mockResolvedValue(params.conversation ?? null),
      findByContact: jest.fn(),
      findMany: jest.fn(),
    } as unknown as IConversationQueryRepository;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: params.fetched ?? null }),
    } as unknown as TSQueryBus;

    return {
      handler: new GetInboundMediaHandler(
        conversationQueryRepo,
        messageQueryRepo,
        queryBus
      ),
      queryBus,
    };
  };

  const mediaMessage = (conversationId: string) =>
    Message.createInbound({
      conversationId,
      type: MessageType.MEDIA,
      mediaUrl: toWhatsappMediaRef('mid-1'),
      externalId: 'wamid.in.1',
    });

  it('medya mesajı: FetchWhatsappMediaQuery dispatch eder ve içeriği döner', async () => {
    const conv = conversation();
    const fetched = { content: Buffer.from('jpegbytes'), mimeType: 'image/jpeg' };
    const { handler, queryBus } = build({
      message: mediaMessage(conv.id),
      conversation: conv,
      fetched,
    });

    const { data } = await handler.execute(
      new GetInboundMediaQuery('clinic-1', conv.id, 'msg-1', ctx)
    );

    const dispatched = (queryBus.execute as jest.Mock).mock.calls[0][0];
    expect(dispatched).toBeInstanceOf(FetchWhatsappMediaQuery);
    expect(dispatched.clinicId).toBe('clinic-1');
    expect(dispatched.mediaId).toBe('mid-1');
    expect(data).toEqual(fetched);
  });

  it('mesaj bulunamazsa NotFoundException', async () => {
    const { handler } = build({ message: null });
    await expect(
      handler.execute(new GetInboundMediaQuery('clinic-1', 'c-1', 'm-x', ctx))
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('yazışma başka kliniğe aitse ForbiddenException', async () => {
    const conv = conversation();
    const { handler } = build({
      message: mediaMessage(conv.id),
      conversation: conv,
    });
    await expect(
      handler.execute(new GetInboundMediaQuery('clinic-OTHER', conv.id, 'm-1', ctx))
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('mesaj medya değilse (referans yok) null döner, bus çağrılmaz', async () => {
    const conv = conversation();
    const textMsg = Message.createInbound({
      conversationId: conv.id,
      body: 'merhaba',
      externalId: 'wamid.t',
    });
    const { handler, queryBus } = build({
      message: textMsg,
      conversation: conv,
    });

    const { data } = await handler.execute(
      new GetInboundMediaQuery('clinic-1', conv.id, 'm-1', ctx)
    );
    expect(data).toBeNull();
    expect(queryBus.execute).not.toHaveBeenCalled();
  });
});
