import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { MarkMessageStatusCommand } from '@modules/messaging/conversation/application/commands/mark-message-status/mark-message-status.command';
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
    it('doğru token → challenge string\'ini birebir döner', () => {
      const { controller } = build(null);
      expect(controller.verify('subscribe', '12345', VERIFY_TOKEN)).toBe(
        '12345'
      );
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

  describe('zengin gelen mesaj tipleri (mapContent)', () => {
    // Tek bir gelen mesajı sarmalayıp dispatch edilen komutun input'unu döndürür.
    const dispatchMessage = async (
      message: Record<string, unknown>
    ): Promise<{
      type: string;
      body: string | null;
      mediaUrl: string | null;
      payload: unknown;
      replyToExternalId: string | null;
    }> => {
      const { controller, commandBus } = build({
        clinicId: 'clinic-1',
        organizationId: 'org-1',
        id: 'ch-1',
        isActive: true,
      });
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'waba-1',
            changes: [
              {
                field: 'messages',
                value: {
                  metadata: { phone_number_id: 'pn-1' },
                  messages: [{ from: '90555', id: 'wamid.x', ...message }],
                },
              },
            ],
          },
        ],
      };
      const req = makeReq(payload);
      await controller.receive(req, sign(req.rawBody!));
      return (commandBus.execute as jest.Mock).mock.calls[0][0].input;
    };

    it('interactive button_reply → INTERACTIVE + başlık body + payload', async () => {
      const input = await dispatchMessage({
        type: 'interactive',
        interactive: {
          type: 'button_reply',
          button_reply: { id: 'btn-evet', title: 'Evet' },
        },
      });
      expect(input.type).toBe('INTERACTIVE');
      expect(input.body).toBe('Evet');
      expect(input.payload).toEqual({
        kind: 'interactive',
        interactiveType: 'button_reply',
        replyId: 'btn-evet',
        title: 'Evet',
      });
    });

    it('location → LOCATION + isim body + lat/long payload', async () => {
      const input = await dispatchMessage({
        type: 'location',
        location: {
          latitude: 41.01,
          longitude: 28.97,
          name: 'Klinik',
          address: 'İstanbul',
        },
      });
      expect(input.type).toBe('LOCATION');
      expect(input.body).toBe('Klinik');
      expect(input.payload).toEqual({
        kind: 'location',
        latitude: 41.01,
        longitude: 28.97,
        name: 'Klinik',
        address: 'İstanbul',
      });
    });

    it('reaction → REACTION + emoji body + hedef wamid payload', async () => {
      const input = await dispatchMessage({
        type: 'reaction',
        reaction: { message_id: 'wamid.target', emoji: '👍' },
      });
      expect(input.type).toBe('REACTION');
      expect(input.body).toBe('👍');
      expect(input.payload).toEqual({
        kind: 'reaction',
        emoji: '👍',
        targetExternalId: 'wamid.target',
      });
    });

    it('contacts → CONTACTS + kişi listesi payload', async () => {
      const input = await dispatchMessage({
        type: 'contacts',
        contacts: [{ name: { formatted_name: 'Dr. Ada' } }],
      });
      expect(input.type).toBe('CONTACTS');
      expect(input.payload).toEqual({
        kind: 'contacts',
        contacts: [{ name: { formatted_name: 'Dr. Ada' } }],
      });
    });

    it('bilinmeyen tip → UNSUPPORTED (gövdesiz)', async () => {
      const input = await dispatchMessage({ type: 'order', order: {} });
      expect(input.type).toBe('UNSUPPORTED');
      expect(input.body).toBeNull();
      expect(input.payload).toBeNull();
    });

    it('context.id → replyToExternalId yakalanır (alıntı)', async () => {
      const input = await dispatchMessage({
        type: 'text',
        text: { body: 'cevap' },
        context: { id: 'wamid.quoted', from: '90555' },
      });
      expect(input.type).toBe('TEXT');
      expect(input.replyToExternalId).toBe('wamid.quoted');
    });

    it('Click-to-WhatsApp referral → InboundReferral map edilir (medium AD)', async () => {
      const input = (await dispatchMessage({
        type: 'text',
        text: { body: 'merhaba' },
        referral: {
          source_type: 'ad',
          source_id: 'ad-123',
          source_url: 'https://fb.me/x',
          ctwa_clid: 'ctwa-xyz',
          headline: 'Saç Ekimi',
        },
      })) as unknown as { referral: Record<string, unknown> };
      expect(input.referral).toEqual({
        medium: 'AD',
        adId: 'ad-123',
        sourceUrl: 'https://fb.me/x',
        ctwaClid: 'ctwa-xyz',
        headline: 'Saç Ekimi',
        body: null,
      });
    });

    it('referral yoksa input.referral undefined', async () => {
      const input = (await dispatchMessage({
        type: 'text',
        text: { body: 'merhaba' },
      })) as unknown as { referral?: unknown };
      expect(input.referral).toBeUndefined();
    });
  });

  describe('status webhook — FAILED hata-kodu eşleme', () => {
    const statusPayload = (status: Record<string, unknown>) => ({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba-1',
          changes: [
            {
              field: 'messages',
              value: { metadata: { phone_number_id: 'pn-1' }, statuses: [status] },
            },
          ],
        },
      ],
    });

    it('failed status → kod TR nedene çevrilir + errorCode taşınır', async () => {
      const { controller, commandBus } = build({
        clinicId: 'clinic-1',
        organizationId: 'org-1',
        id: 'ch-1',
        isActive: true,
      });
      const req = makeReq(
        statusPayload({
          id: 'wamid.out.1',
          status: 'failed',
          errors: [{ code: 131047, title: 'Re-engagement message' }],
        })
      );

      await controller.receive(req, sign(req.rawBody!));

      const cmd = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(cmd).toBeInstanceOf(MarkMessageStatusCommand);
      expect(cmd.payload.status).toBe('FAILED');
      expect(cmd.payload.errorReason).toMatch(/24 saatlik/);
      expect(cmd.payload.errorCode).toBe('131047');
    });

    it('delivered status → reason/kod taşınmaz', async () => {
      const { controller, commandBus } = build({
        clinicId: 'clinic-1',
        organizationId: 'org-1',
        id: 'ch-1',
        isActive: true,
      });
      const req = makeReq(
        statusPayload({ id: 'wamid.out.1', status: 'delivered' })
      );

      await controller.receive(req, sign(req.rawBody!));

      const cmd = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(cmd.payload.status).toBe('DELIVERED');
      expect(cmd.payload.errorReason).toBeNull();
      expect(cmd.payload.errorCode).toBeNull();
    });
  });
});
