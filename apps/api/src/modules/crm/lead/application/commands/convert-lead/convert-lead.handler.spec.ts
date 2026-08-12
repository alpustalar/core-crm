import { ConvertLeadHandler } from './convert-lead.handler';
import { ConvertLeadCommand } from './convert-lead.command';
import { CreatePatientCommand } from '@modules/crm/patient/application/commands/create-patient/create-patient.command';
import { LeadConvertMissingTargetException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { randomUUID } from 'crypto';

describe('ConvertLeadHandler — dönüşümde otomatik hasta oluşturma', () => {
  const clinicId = randomUUID();
  const organizationId = randomUUID();
  const ctx = { actor: {}, source: 'WEB' } as never;

  // policyFactory fluent API — testte geçişli (no-op) mock.
  const policyFactory = {
    clinic: () => ({
      evaluator: {
        check: () => ({ orThrow: () => undefined }),
      },
    }),
    entity: () => ({ policy: { getValidateOptions: () => ({}) } }),
  };

  function buildLead(opts: { withContact: boolean }) {
    return Lead.create({
      clinicId,
      organizationId,
      source: 'WHATSAPP',
      name: opts.withContact ? 'Ada Lovelace' : undefined,
      phone: opts.withContact ? '+905550001122' : undefined,
    });
  }

  function build(lead: Lead, createdPatientId = randomUUID()) {
    const leadCommandRepo = {
      findById: jest.fn(async () => lead),
      update: jest.fn(async (l: Lead) => l),
      create: jest.fn(),
    };
    const commandBus = {
      execute: jest.fn(async (_cmd: CreatePatientCommand) => createdPatientId),
    };
    const queryBus = { execute: jest.fn(async () => ({ data: null })) };
    const txManager = { run: jest.fn((fn: () => Promise<void>) => fn()) };

    const handler = new ConvertLeadHandler(
      leadCommandRepo as never,
      policyFactory as never,
      queryBus as never,
      commandBus as never,
      txManager as never
    );
    return { handler, leadCommandRepo, commandBus, createdPatientId };
  }

  it('patientId verilirse mevcut hasta bağlanır, yeni hasta OLUŞTURULMAZ', async () => {
    const lead = buildLead({ withContact: true });
    const { handler, commandBus, leadCommandRepo } = build(lead);
    const existingPatientId = randomUUID();

    await handler.execute(
      new ConvertLeadCommand({
        leadId: lead.id.value,
        data: { patientId: existingPatientId, clinicId },
        ctx,
      })
    );

    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(lead.status).toBe('CONVERTED');
    expect(lead.patientId?.value).toBe(existingPatientId);
    expect(leadCommandRepo.update).toHaveBeenCalled();
  });

  it('patientId yok + lead telefon/isim taşıyor → CreatePatientCommand ile hasta oluşturulur ve bağlanır', async () => {
    const lead = buildLead({ withContact: true });
    const { handler, commandBus, createdPatientId } = build(lead);

    await handler.execute(
      new ConvertLeadCommand({ leadId: lead.id.value, data: { clinicId }, ctx })
    );

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const dispatched = commandBus.execute.mock.calls[0][0];
    expect(dispatched).toBeInstanceOf(CreatePatientCommand);
    expect(dispatched.data).toMatchObject({
      phone: '+905550001122',
      firstName: 'Ada Lovelace',
      organizationId,
      clinicId,
    });
    expect(lead.status).toBe('CONVERTED');
    expect(lead.patientId?.value).toBe(createdPatientId);
  });

  it('patientId yok + telefon/isim yok + appointmentId yok → LeadConvertMissingTargetException', async () => {
    const lead = buildLead({ withContact: false });
    const { handler, commandBus } = build(lead);

    await expect(
      handler.execute(
        new ConvertLeadCommand({ leadId: lead.id.value, data: { clinicId }, ctx })
      )
    ).rejects.toBeInstanceOf(LeadConvertMissingTargetException);

    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('patientId yok + telefon/isim yok ama appointmentId var → hasta oluşturmadan dönüşür', async () => {
    const lead = buildLead({ withContact: false });
    const { handler, commandBus } = build(lead);
    const appointmentId = randomUUID();

    await handler.execute(
      new ConvertLeadCommand({
        leadId: lead.id.value,
        data: { appointmentId, clinicId },
        ctx,
      })
    );

    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(lead.status).toBe('CONVERTED');
    expect(lead.appointmentId?.value).toBe(appointmentId);
  });
});
