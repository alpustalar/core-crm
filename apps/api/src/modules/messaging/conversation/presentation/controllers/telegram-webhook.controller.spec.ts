import { ForbiddenException } from '@nestjs/common';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { RequestTelegramContactCommand } from '@modules/messaging/channel-config/application/commands/request-telegram-contact/request-telegram-contact.command';
import { GetConversationContactStateQuery } from '@modules/messaging/conversation/application/queries/get-conversation-contact-state/get-conversation-contact-state.query';
import { TelegramWebhookUpdate } from '../../domain/contracts/telegram-webhook.contracts';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

const SECRET = 'klinik-secret';

describe('TelegramWebhookController (public webhook)', () => {
  const build = (
    routing: {
      organizationId: string;
      webhookSecret: string | null;
      isActive: boolean;
    } | null,
    // Var olan konuşma durumu (prompt-once kararı için); null = konuşma yok (yeni).
    contactState: {
      conversationId: string;
      patientId: string | null;
    } | null = {
      conversationId: 'conv-1',
      patientId: null,
    }
  ) => {
    const commandBus = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as TSCommandBus;

    // Routing ve konuşma-durum sorgularını tipine göre ayrı yanıtla.
    const queryBus = {
      execute: jest.fn((query: unknown) => {
        if (query instanceof GetConversationContactStateQuery) {
          return Promise.resolve({ data: contactState });
        }
        return Promise.resolve({ data: routing });
      }),
    } as unknown as TSQueryBus;

    const controller = new TelegramWebhookController(commandBus, queryBus);
    return { controller, commandBus, queryBus };
  };

  const textUpdate = (text: string): TelegramWebhookUpdate => ({
    update_id: 1,
    message: {
      message_id: 1001,
      from: { id: 555, first_name: 'Ada', last_name: 'Lovelace' },
      chat: { id: 555, type: 'private' },
      date: 1700000000,
      text,
    },
  });

  const activeRouting = {
    organizationId: 'org-1',
    webhookSecret: SECRET,
    isActive: true,
  };

  it('geçerli secret + text → ReceiveInboundMessageCommand (channel=TELEGRAM) dispatch', async () => {
    const { controller, commandBus } = build(activeRouting);

    const result = await controller.onUpdate(
      'clinic-1',
      SECRET,
      textUpdate('merhaba')
    );

    expect(result).toEqual({ ok: true });
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const cmd = (commandBus.execute as jest.Mock).mock.calls[0][0];
    expect(cmd).toBeInstanceOf(ReceiveInboundMessageCommand);
    expect(cmd.input.channel).toBe('TELEGRAM');
    expect(cmd.input.clinicId).toBe('clinic-1');
    expect(cmd.input.organizationId).toBe('org-1');
    expect(cmd.input.contactPhone).toBe('555');
    expect(cmd.input.contactName).toBe('Ada Lovelace');
    expect(cmd.input.externalId).toBe('tg:555:1001');
    expect(cmd.input.type).toBe('TEXT');
    expect(cmd.input.body).toBe('merhaba');
  });

  it('yeni misafir konuşma + text → ReceiveInbound + RequestTelegramContact (prompt bir kez)', async () => {
    const { controller, commandBus } = build(activeRouting, null); // konuşma yok = yeni

    await controller.onUpdate('clinic-1', SECRET, textUpdate('merhaba'));

    const commands = (commandBus.execute as jest.Mock).mock.calls.map(
      (c) => c[0]
    );
    expect(commands).toHaveLength(2);
    expect(commands[0]).toBeInstanceOf(ReceiveInboundMessageCommand);
    expect(commands[0].input.matchPhone).toBeNull(); // text'te eşleme telefonu yok
    const prompt = commands.find(
      (c) => c instanceof RequestTelegramContactCommand
    );
    expect(prompt).toBeDefined();
    expect(prompt!.clinicId).toBe('clinic-1');
    expect(prompt!.chatId).toBe('555');
  });

  it('var olan konuşma + text → prompt tekrar gönderilmez', async () => {
    const { controller, commandBus } = build(activeRouting, {
      conversationId: 'conv-1',
      patientId: null,
    });

    await controller.onUpdate('clinic-1', SECRET, textUpdate('tekrar'));

    const commands = (commandBus.execute as jest.Mock).mock.calls.map(
      (c) => c[0]
    );
    expect(commands).toHaveLength(1);
    expect(
      commands.some((c) => c instanceof RequestTelegramContactCommand)
    ).toBe(false);
  });

  it('contact paylaşımı → matchPhone (rakam-only) ile eşleme, prompt yok', async () => {
    const { controller, commandBus } = build(activeRouting, null);

    await controller.onUpdate('clinic-1', SECRET, {
      update_id: 9,
      message: {
        message_id: 3003,
        from: { id: 555, first_name: 'Ada' },
        chat: { id: 555 },
        contact: { phone_number: '+90 555 000 11 22', user_id: 555 },
      },
    });

    const commands = (commandBus.execute as jest.Mock).mock.calls.map(
      (c) => c[0]
    );
    // Contact paylaşımında prompt gönderilmez (zaten paylaşıyorlar).
    expect(
      commands.some((c) => c instanceof RequestTelegramContactCommand)
    ).toBe(false);
    const inbound = commands.find(
      (c) => c instanceof ReceiveInboundMessageCommand
    );
    expect(inbound).toBeDefined();
    expect(inbound!.input.matchPhone).toBe('905550001122');
    expect(inbound!.input.type).toBe('CONTACTS');
    expect(inbound!.input.contactPhone).toBe('555'); // chatId kimliği değişmez
  });

  it('secret eşleşmezse → ForbiddenException, dispatch yok', async () => {
    const { controller, commandBus } = build(activeRouting);

    await expect(
      controller.onUpdate('clinic-1', 'yanlis-secret', textUpdate('x'))
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('kanal pasifse → ForbiddenException', async () => {
    const { controller } = build({ ...activeRouting, isActive: false });
    await expect(
      controller.onUpdate('clinic-1', SECRET, textUpdate('x'))
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('kanal yoksa → ForbiddenException', async () => {
    const { controller } = build(null);
    await expect(
      controller.onUpdate('clinic-1', SECRET, textUpdate('x'))
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('mesajsız update (ör. yalnız callback) → ok döner, dispatch yok', async () => {
    const { controller, commandBus } = build(activeRouting);
    const result = await controller.onUpdate('clinic-1', SECRET, {
      update_id: 2,
    });
    expect(result).toEqual({ ok: true });
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('text/caption olmayan mesaj → UNSUPPORTED placeholder body', async () => {
    const { controller, commandBus } = build(activeRouting);
    await controller.onUpdate('clinic-1', SECRET, {
      update_id: 3,
      message: {
        message_id: 2002,
        from: { id: 555, username: 'ada' },
        chat: { id: 555 },
      },
    });
    const cmd = (commandBus.execute as jest.Mock).mock.calls[0][0];
    expect(cmd.input.type).toBe('UNSUPPORTED');
    expect(cmd.input.body).toBe('[desteklenmeyen mesaj]');
    expect(cmd.input.contactName).toBe('ada');
  });
});
