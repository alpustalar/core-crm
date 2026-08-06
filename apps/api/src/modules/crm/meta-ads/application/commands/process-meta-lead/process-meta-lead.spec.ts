import { ProcessMetaLeadHandler } from './process-meta-lead.handler';
import { ProcessMetaLeadCommand } from './process-meta-lead.command';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import {
  IMetaLeadCommandRepository,
  IMetaLeadQueryRepository,
} from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { IMetaAdAccountQueryRepository } from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { IMetaAdsEventPublisher } from '@modules/crm/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

describe('ProcessMetaLeadHandler (MetaLead → birleşik Lead köprüsü)', () => {
  const buildFakeMetaLead = () => ({
    id: { value: 'ml-uuid-1' },
    name: 'Ada',
    phone: { value: '+905550001122' },
    email: null,
    campaignId: 'camp-1',
    campaignName: 'Yaz Kampanyası',
    adId: 'ad-1',
    adsetId: 'adset-1',
    status: 'NEW',
    matchedPatientId: null,
    matchToPatient: jest.fn(),
  });

  const build = (params: { existing?: unknown }) => {
    const fakeLead = buildFakeMetaLead();

    const leadCommandRepo = {
      create: jest.fn().mockResolvedValue(fakeLead),
      update: jest.fn().mockResolvedValue(fakeLead),
    } as unknown as IMetaLeadCommandRepository;

    const leadQueryRepo = {
      findByMetaLeadId: jest.fn().mockResolvedValue(params.existing ?? null),
    } as unknown as IMetaLeadQueryRepository;

    const accountQueryRepo = {
      findById: jest
        .fn()
        .mockResolvedValue({ clinicId: { value: 'clinic-1' } }),
    } as unknown as IMetaAdAccountQueryRepository;

    const eventPublisher = {
      leadReceived: jest.fn(),
    } as unknown as IMetaAdsEventPublisher;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: null }), // hasta eşleşmesi yok
    } as unknown as TSQueryBus;

    const commandBus = {
      execute: jest.fn().mockResolvedValue('unified-lead-1'),
    } as unknown as TSCommandBus;

    // Yazma + event yayını tek transaction'da; testte callback doğrudan çalıştırılır.
    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new ProcessMetaLeadHandler(
      leadCommandRepo,
      leadQueryRepo,
      accountQueryRepo,
      eventPublisher,
      queryBus,
      commandBus,
      txManager
    );

    return { handler, commandBus, leadCommandRepo, eventPublisher, txManager };
  };

  const command = new ProcessMetaLeadCommand({
    metaLeadId: 'meta-lead-99',
    metaAdAccountId: 'acc-1',
    formId: 'form-1',
    campaignId: 'camp-1',
    campaignName: 'Yaz Kampanyası',
    adsetId: 'adset-1',
    adId: 'ad-1',
    name: 'Ada',
    phone: '+905550001122',
  });

  it('yeni MetaLead → CreateLeadCommand (META_FORM/FORM + metaLeadId + kampanya) dispatch edilir', async () => {
    const t = build({});

    await t.handler.execute(command);

    expect(t.commandBus.execute).toHaveBeenCalledTimes(1);
    const cmd = (t.commandBus.execute as jest.Mock).mock
      .calls[0][0] as CreateLeadCommand;
    expect(cmd).toBeInstanceOf(CreateLeadCommand);
    expect(cmd.payload.clinicId).toBe('clinic-1');
    expect(cmd.payload.data.source).toBe('META_FORM');
    expect(cmd.payload.data.medium).toBe('FORM');
    expect(cmd.payload.data.metaLeadId).toBe('ml-uuid-1');
    expect(cmd.payload.data.campaignId).toBe('camp-1');
    expect(cmd.payload.data.campaignName).toBe('Yaz Kampanyası');
    expect(cmd.payload.data.adId).toBe('ad-1');
    expect(cmd.payload.data.phone).toBe('+905550001122');
  });

  it('yazma + event yayını transaction içinde yapılır (event ALS bağlamı bulmadan düşerdi)', async () => {
    const t = build({});

    await t.handler.execute(command);

    expect(t.txManager.run).toHaveBeenCalledTimes(1);
    expect(t.eventPublisher.leadReceived).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'clinic-1' })
    );
  });

  it('MetaLead zaten var (idempotency) → köprü çalışmaz, Lead üretilmez', async () => {
    const t = build({
      existing: {
        id: { value: 'ml-uuid-1' },
        status: 'NEW',
        matchedPatientId: null,
      },
    });

    await t.handler.execute(command);

    expect(t.commandBus.execute).not.toHaveBeenCalled();
    expect(t.leadCommandRepo.create).not.toHaveBeenCalled();
  });
});
