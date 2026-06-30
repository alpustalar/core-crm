import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

const APP_SECRET = 'ig-app-secret';
const VERIFY_TOKEN = 'ig-verify-token';

describe('InstagramWebhookController (public webhook)', () => {
  const build = (
    routing: {
      clinicId: string;
      organizationId: string;
      isActive: boolean;
    } | null
  ) => {
    const configService = {
      getOrThrow: jest.fn((key: string) =>
        key === 'INSTAGRAM_APP_SECRET' ? APP_SECRET : VERIFY_TOKEN
      ),
    } as unknown as ConfigService;

    const commandBus = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as TSCommandBus;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: routing }),
    } as unknown as TSQueryBus;

    const controller = new InstagramWebhookController(
      configService,
      commandBus,
      queryBus
    );
    return { controller, commandBus };
  };

  const sign = (raw: Buffer) =>
    `sha256=${crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex')}`;

  const inbound = (msg: Record<string, unknown>) => ({
    object: 'instagram',
    entry: [
      {
        id: 'ig-123', // IG account id
        messaging: [
          {
            sender: { id: 'IGSID-777' },
            recipient: { id: 'ig-123' },
            timestamp: 1700000000000,
            message: msg,
          },
        ],
      },
    ],
  });

  const makeReq = (payload: unknown): RawBodyRequest<Request> => {
    const rawBody = Buffer.from(JSON.stringify(payload));
    return { rawBody, body: payload } as unknown as RawBodyRequest<Request>;
  };

  const activeRouting = {
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    isActive: true,
  };

  describe('GET verify', () => {
    it('doğru token → challenge döner', () => {
      const { controller } = build(null);
      expect(controller.verify('subscribe', 'xyz', VERIFY_TOKEN)).toBe('xyz');
    });

    it('yanlış token → ForbiddenException', () => {
      const { controller } = build(null);
      expect(() => controller.verify('subscribe', 'xyz', 'wrong')).toThrow(
        ForbiddenException
      );
    });
  });

  describe('POST receive', () => {
    it('geçersiz imza → ForbiddenException, dispatch yok', async () => {
      const { controller, commandBus } = build(activeRouting);
      const req = makeReq(inbound({ mid: 'm-1', text: 'merhaba' }));
      await expect(
        controller.receive(req, 'sha256=bozuk')
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('bilinen IG hesabı + text → ReceiveInboundMessageCommand (channel=INSTAGRAM)', async () => {
      const { controller, commandBus } = build(activeRouting);
      const req = makeReq(inbound({ mid: 'm-1', text: 'merhaba' }));

      const result = await controller.receive(req, sign(req.rawBody!));

      expect(result).toEqual({ status: 'ok' });
      const cmd = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(cmd).toBeInstanceOf(ReceiveInboundMessageCommand);
      expect(cmd.input.channel).toBe('INSTAGRAM');
      expect(cmd.input.clinicId).toBe('clinic-1');
      expect(cmd.input.organizationId).toBe('org-1');
      expect(cmd.input.contactPhone).toBe('IGSID-777');
      expect(cmd.input.externalId).toBe('m-1');
      expect(cmd.input.type).toBe('TEXT');
      expect(cmd.input.body).toBe('merhaba');
    });

    it('echo mesajı (is_echo) → atlanır', async () => {
      const { controller, commandBus } = build(activeRouting);
      const req = makeReq(inbound({ mid: 'm-2', text: 'biz', is_echo: true }));
      await controller.receive(req, sign(req.rawBody!));
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('bilinmeyen IG hesabı → dispatch edilmez', async () => {
      const { controller, commandBus } = build(null);
      const req = makeReq(inbound({ mid: 'm-3', text: 'merhaba' }));
      await controller.receive(req, sign(req.rawBody!));
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('text olmayan (attachment) → UNSUPPORTED placeholder', async () => {
      const { controller, commandBus } = build(activeRouting);
      const req = makeReq(
        inbound({ mid: 'm-4', attachments: [{ type: 'image' }] })
      );
      await controller.receive(req, sign(req.rawBody!));
      const cmd = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(cmd.input.type).toBe('UNSUPPORTED');
      expect(cmd.input.body).toBe('[desteklenmeyen mesaj]');
    });
  });
});
