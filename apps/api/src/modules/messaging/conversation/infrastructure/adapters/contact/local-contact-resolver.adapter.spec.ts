import { MessageChannel } from '@shared';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import { LocalContactResolverAdapter } from './local-contact-resolver.adapter';

describe('LocalContactResolverAdapter (messaging → core kontak sınırı)', () => {
  const build = (params: {
    patient?: { id: string } | null;
    queryImpl?: jest.Mock;
    commandImpl?: jest.Mock;
  }) => {
    const queryBus = {
      execute:
        params.queryImpl ??
        jest.fn().mockResolvedValue({ data: params.patient ?? null }),
    } as unknown as TSQueryBus;

    const commandBus = {
      execute: params.commandImpl ?? jest.fn().mockResolvedValue('lead-1'),
    } as unknown as TSCommandBus;

    return {
      adapter: new LocalContactResolverAdapter(commandBus, queryBus),
      queryBus,
      commandBus,
    };
  };

  const referral = {
    adId: 'ad-123',
    ctwaClid: 'ctwa-xyz',
    sourceUrl: 'https://fb.me/x',
  };

  describe('findPatientId', () => {
    it('WhatsApp: contactPhone gerçek telefondur → onunla sorgulanır', async () => {
      const t = build({ patient: { id: 'p-1' } });

      const id = await t.adapter.findPatientId({
        clinicId: 'clinic-1',
        channel: MessageChannel.WHATSAPP,
        contactPhone: '+905550001122',
      });

      expect(id).toBe('p-1');
      const query = (t.queryBus.execute as jest.Mock).mock
        .calls[0][0] as FindPatientByContactQuery;
      expect(query).toBeInstanceOf(FindPatientByContactQuery);
      expect(query.payload.phone).toBe('+905550001122');
    });

    it('Telegram: contactPhone chatId olduğundan matchPhone yoksa HİÇ sorgulanmaz', async () => {
      // chatId'yi telefon sanıp sorgulamak yanlış hastayla eşleşme riskidir.
      const t = build({ patient: { id: 'p-1' } });

      const id = await t.adapter.findPatientId({
        clinicId: 'clinic-1',
        channel: MessageChannel.TELEGRAM,
        contactPhone: '987654321',
      });

      expect(id).toBeNull();
      expect(t.queryBus.execute).not.toHaveBeenCalled();
    });

    it('Telegram: contact paylaşımından gelen matchPhone ile sorgulanır', async () => {
      const t = build({ patient: { id: 'p-7' } });

      const id = await t.adapter.findPatientId({
        clinicId: 'clinic-1',
        channel: MessageChannel.TELEGRAM,
        contactPhone: '987654321',
        matchPhone: '905550001122',
      });

      expect(id).toBe('p-7');
      const query = (t.queryBus.execute as jest.Mock).mock
        .calls[0][0] as FindPatientByContactQuery;
      expect(query.payload.phone).toBe('905550001122');
    });

    it('sorgu patlarsa misafir olarak devam edilir (mesaj işleme bloklanmaz)', async () => {
      const t = build({
        queryImpl: jest
          .fn()
          .mockRejectedValue(new Error('patient servisi yok')),
      });

      await expect(
        t.adapter.findPatientId({
          clinicId: 'clinic-1',
          channel: MessageChannel.WHATSAPP,
          contactPhone: '+905550001122',
        })
      ).resolves.toBeNull();
    });
  });

  describe('registerAdReferralLead', () => {
    it("WhatsApp: attribution CreateLeadCommand'a çevrilir, telefon taşınır", async () => {
      const t = build({});

      const leadId = await t.adapter.registerAdReferralLead({
        clinicId: 'clinic-1',
        organizationId: 'org-1',
        channel: MessageChannel.WHATSAPP,
        contactPhone: '+905550001122',
        contactName: 'Ada',
        referral,
      });

      expect(leadId).toBe('lead-1');
      const cmd = (t.commandBus.execute as jest.Mock).mock
        .calls[0][0] as CreateLeadCommand;
      expect(cmd).toBeInstanceOf(CreateLeadCommand);
      expect(cmd.payload.clinicId).toBe('clinic-1');
      expect(cmd.payload.data.source).toBe('WHATSAPP');
      expect(cmd.payload.data.medium).toBe('AD');
      expect(cmd.payload.data.adId).toBe('ad-123');
      expect(cmd.payload.data.ctwaClid).toBe('ctwa-xyz');
      expect(cmd.payload.data.name).toBe('Ada');
      expect(cmd.payload.data.phone).toBe('+905550001122');
    });

    it('Instagram: contactPhone IGSID olduğundan lead telefonu BOŞ bırakılır', async () => {
      const t = build({});

      await t.adapter.registerAdReferralLead({
        clinicId: 'clinic-1',
        organizationId: 'org-1',
        channel: MessageChannel.INSTAGRAM,
        contactPhone: '17841400000000',
        contactName: null,
        referral,
      });

      const cmd = (t.commandBus.execute as jest.Mock).mock
        .calls[0][0] as CreateLeadCommand;
      expect(cmd.payload.data.source).toBe('INSTAGRAM');
      expect(cmd.payload.data.phone).toBeUndefined();
    });

    it('lead üretimi patlarsa null döner (attribution best-effort)', async () => {
      const t = build({
        commandImpl: jest.fn().mockRejectedValue(new Error('lead servisi yok')),
      });

      await expect(
        t.adapter.registerAdReferralLead({
          clinicId: 'clinic-1',
          organizationId: 'org-1',
          channel: MessageChannel.WHATSAPP,
          contactPhone: '+905550001122',
          referral,
        })
      ).resolves.toBeNull();
    });
  });
});
