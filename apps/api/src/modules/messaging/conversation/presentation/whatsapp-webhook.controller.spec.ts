import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

const APP_SECRET = 'test-app-secret';
const VERIFY_TOKEN = 'test-verify-token';

describe('WhatsappWebhookController (public webhook)', () => {
  const build = (channel: { clinicId: string; organizationId: string; id: string; isActive: boolean } | null) => {
    const configService = {
      getOrThrow: jest.fn((key: string) =>
        key === 'WHATSAPP_APP_SECRET' ? APP_SECRET : VERIFY_TOKEN
      ),
    } as unknown as ConfigService;

    const commandBus = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as TSCommandBus;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: channel }),
    } as unknown as TSQueryBus;

    const controller = new WhatsappWebhookController(
      configService,
      commandBus,
      queryBus
    );
    return { controller, commandBus, queryBus };
  };

  const sign = (raw: Buffer) =>
    `sha256=${crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex')}`;

  const inboundPayload = (phoneNumberId: string) => ({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'waba-1',
        changes: [
          {
            field: 'messages',
            value: {
              metadata: { phone_number_id: phoneNumberId },
              contacts: [{ profile: { name: 'Ada' }, wa_id: '905550001122' }],
              messages: [
                {
                  from: '905550001122',
                  id: 'wamid.in.1',
                  timestamp: '1700000000',
                  type: 'text',
                  text: { body: 'merhaba' },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  const makeReq = (payload: unknown): RawBodyRequest<Request> => {
    const rawBody = Buffer.from(JSON.stringify(payload));
    return { rawBody, body: payload } as unknown as RawBodyRequest<Request>;
  };

  describe('GET verify', () => {
    it('doğru token → challenge sayısını döner', () => {
      const { controller } = build(null);
      expect(controller.verify('subscribe', '12345', VERIFY_TOKEN)).toBe(12345);
    });

    it('yanlış token → ForbiddenException', () => {
      const { controller } = build(null);
      expect(() => controller.verify('subscribe', '12345', 'wrong')).toThrow(
        ForbiddenException
      );
    });
  });

  describe('POST receive', () => {
    it('geçersiz imza → ForbiddenException', async () => {
      const { controller, commandBus } = build({
        clinicId: 'clinic-1',
        organizationId: 'org-1',
        id: 'ch-1',
        isActive: true,
      });
      const req = makeReq(inboundPayload('pn-1'));

      await expect(
        controller.receive(req, 'sha256=bozuk')
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('bilinen phone_number_id → ReceiveInboundMessageCommand dispatch edilir', async () => {
      const { controller, commandBus } = build({
        clinicId: 'clinic-1',
        organizationId: 'org-1',
        id: 'ch-1',
        isActive: true,
      });
      const payload = inboundPayload('pn-1');
      const req = makeReq(payload);

      const result = await controller.receive(req, sign(req.rawBody!));

      expect(result).toEqual({ status: 'ok' });
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      const dispatched = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(dispatched).toBeInstanceOf(ReceiveInboundMessageCommand);
      expect(dispatched.input.clinicId).toBe('clinic-1');
      expect(dispatched.input.organizationId).toBe('org-1');
      expect(dispatched.input.externalId).toBe('wamid.in.1');
      expect(dispatched.input.contactPhone).toBe('905550001122');
    });

    it('bilinmeyen phone_number_id → komut dispatch edilmez (yok sayılır)', async () => {
      const { controller, commandBus } = build(null); // kanal yok
      const req = makeReq(inboundPayload('pn-UNKNOWN'));

      const result = await controller.receive(req, sign(req.rawBody!));

      expect(result).toEqual({ status: 'ok' });
      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });
});
