import { Lead } from './lead.entity';
import {
  LeadConvertedEvent,
  LeadCreatedEvent,
  LeadLostEvent,
  LeadStatusChangedEvent,
} from '@modules/crm/lead/domain/events';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { randomUUID } from 'crypto';

describe('Lead entity — attribution alanları', () => {
  const clinicId = randomUUID();
  const organizationId = randomUUID();

  it("create → getter'lar ve toPersistence attribution'ı taşır (reklam)", () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'WHATSAPP',
      name: 'Ada Lovelace',
      phone: '+905550001122',
      medium: 'AD',
      adId: 'ad-123',
      campaignId: 'camp-1',
      campaignName: 'Saç Ekimi Kampanyası',
      adsetId: 'adset-1',
      ctwaClid: 'ctwa-xyz',
      sourceUrl: 'https://fb.me/x',
    });

    expect(lead.medium).toBe('AD');
    expect(lead.adId).toBe('ad-123');
    expect(lead.campaignId).toBe('camp-1');
    expect(lead.campaignName).toBe('Saç Ekimi Kampanyası');
    expect(lead.adsetId).toBe('adset-1');
    expect(lead.ctwaClid).toBe('ctwa-xyz');
    expect(lead.sourceUrl).toBe('https://fb.me/x');

    const raw = lead.toPersistence();
    expect(raw.medium).toBe('AD');
    expect(raw.adId).toBe('ad-123');
    expect(raw.campaignId).toBe('camp-1');
    expect(raw.ctwaClid).toBe('ctwa-xyz');
    expect(raw.sourceUrl).toBe('https://fb.me/x');
    expect(raw.metaLeadId).toBeNull();
  });

  it('create → Meta form köprüsü: metaLeadId + medium FORM taşınır', () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'META_FORM',
      medium: 'FORM',
      metaLeadId: 'ml-uuid-1',
      campaignId: 'camp-9',
    });

    expect(lead.medium).toBe('FORM');
    expect(lead.metaLeadId).toBe('ml-uuid-1');
    expect(lead.toPersistence().metaLeadId).toBe('ml-uuid-1');
  });

  it('create → LeadCreatedEvent entity içinde raise edilir (actorId + logSource taşır)', () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'WHATSAPP',
      actorId: 'user-42',
      logSource: LogSource.WEB,
    });

    const events = lead.getDomainEvents();
    expect(events).toHaveLength(1);
    const event = events[0] as LeadCreatedEvent;
    expect(event).toBeInstanceOf(LeadCreatedEvent);
    expect(event.leadId).toBe(lead.id.value);
    expect(event.log?.actorId).toBe('user-42');
    expect(event.log?.source).toBe(LogSource.WEB);
  });

  it('logSource verilmezse audit source SYSTEM (webhook akışı)', () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'INSTAGRAM' });
    const event = lead.getDomainEvents()[0] as LeadCreatedEvent;
    expect(event.log?.source).toBe(LogSource.SYSTEM);
  });

  it('attribution verilmezse tüm alanlar null (organik/manuel)', () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL' });

    const raw = lead.toPersistence();
    expect(raw.medium).toBeNull();
    expect(raw.metaLeadId).toBeNull();
    expect(raw.campaignId).toBeNull();
    expect(raw.adId).toBeNull();
    expect(raw.ctwaClid).toBeNull();
    expect(raw.sourceUrl).toBeNull();
  });
});

describe('Lead entity — satış hunisi (moveToStage / assignStage)', () => {
  const clinicId = randomUUID();
  const organizationId = randomUUID();
  const pipelineId = randomUUID();
  const stageId = randomUUID();
  /** Event payload'ının audit alanları — her state geçişi bunu ister. */
  const audit = {
    actorId: 'user-1',
    logSource: LogSource.WEB,
    stageName: 'Test Aşaması',
  };

  it('create → seed edilen pipelineId/stageId taşınır', () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'MANUAL',
      pipelineId,
      stageId,
    });
    expect(lead.pipelineId).toBe(pipelineId);
    expect(lead.stageId).toBe(stageId);
    expect(lead.toPersistence().stageId).toBe(stageId);
  });

  it('moveToStage(OPEN) → stageId değişir, status NEW kalır (senkron yok)', () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'MANUAL',
      pipelineId,
      stageId,
    });
    const targetStage = randomUUID();

    lead.moveToStage({
      pipelineId,
      stageId: targetStage,
      stageType: 'OPEN',
      ...audit,
    });

    expect(lead.stageId).toBe(targetStage);
    expect(lead.status).toBe('NEW');
    expect(lead.convertedAt).toBeNull();
    expect(lead.lostAt).toBeNull();
  });

  it('moveToStage(WON) → status CONVERTED + convertedAt set', () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'MANUAL',
      pipelineId,
      stageId,
    });
    const wonStage = randomUUID();

    lead.moveToStage({
      pipelineId,
      stageId: wonStage,
      stageType: 'WON',
      ...audit,
    });

    expect(lead.status).toBe('CONVERTED');
    expect(lead.stageId).toBe(wonStage);
    expect(lead.convertedAt).toBeInstanceOf(Date);
    expect(lead.lostAt).toBeNull();
  });

  it('moveToStage(LOST) → status LOST + lostReason + lostAt set', () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'MANUAL',
      pipelineId,
      stageId,
    });
    const lostStage = randomUUID();

    lead.moveToStage({
      pipelineId,
      stageId: lostStage,
      stageType: 'LOST',
      reason: 'Bütçe yetersiz',
      ...audit,
    });

    expect(lead.status).toBe('LOST');
    expect(lead.lostReason).toBe('Bütçe yetersiz');
    expect(lead.lostAt).toBeInstanceOf(Date);
    expect(lead.convertedAt).toBeNull();
  });

  it('moveToStage: terminalden (LOST) OPEN aşamaya geri → QUALIFIED olarak reaktive olur', () => {
    const lead = Lead.create({
      clinicId,
      organizationId,
      source: 'MANUAL',
      pipelineId,
      stageId,
    });
    lead.moveToStage({
      pipelineId,
      stageId: randomUUID(),
      stageType: 'LOST',
      ...audit,
    });
    expect(lead.status).toBe('LOST');

    const reopenStage = randomUUID();
    lead.moveToStage({
      pipelineId,
      stageId: reopenStage,
      stageType: 'OPEN',
      ...audit,
    });

    expect(lead.status).toBe('QUALIFIED');
    expect(lead.stageId).toBe(reopenStage);
    expect(lead.lostAt).toBeNull();
    expect(lead.lostReason).toBeNull();
  });

  it("assignStage → yalnız pipelineId/stageId atar, status'a dokunmaz", () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL' });
    const p = randomUUID();
    const s = randomUUID();

    lead.assignStage({ pipelineId: p, stageId: s });

    expect(lead.pipelineId).toBe(p);
    expect(lead.stageId).toBe(s);
    expect(lead.status).toBe('NEW');
  });
});

describe('Lead entity — durum geçişi event\'leri', () => {
  const clinicId = randomUUID();
  const organizationId = randomUUID();
  const audit = { actorId: 'user-1', logSource: LogSource.WEB };

  /** `create` kendi event'ini raise ediyor; geçiş testleri onu saymasın. */
  const freshLead = () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL' });
    lead.clearDomainEvents();
    return lead;
  };

  it('convert → LeadConvertedEvent (hasta + randevu id taşır)', () => {
    const lead = freshLead();
    const patientId = randomUUID();
    const appointmentId = randomUUID();

    lead.convert({ patientId, appointmentId, ...audit });

    const events = lead.getDomainEvents();
    expect(events).toHaveLength(1);
    const event = events[0] as LeadConvertedEvent;
    expect(event).toBeInstanceOf(LeadConvertedEvent);
    expect(event.leadId).toBe(lead.id.value);
    expect(event.patientId).toBe(patientId);
    expect(event.appointmentId).toBe(appointmentId);
    expect(event.log?.actorId).toBe('user-1');
    expect(event.log?.source).toBe(LogSource.WEB);
  });

  it('markLost → LeadLostEvent (sebep payload ve audit metnine girer)', () => {
    const lead = freshLead();

    lead.markLost({ reason: 'Bütçe yetersiz', ...audit });

    const event = lead.getDomainEvents()[0] as LeadLostEvent;
    expect(event).toBeInstanceOf(LeadLostEvent);
    expect(event.lostReason).toBe('Bütçe yetersiz');
    expect(event.log?.details).toContain('Bütçe yetersiz');
  });

  it('contact/qualify → LeadStatusChangedEvent, önceki durumu entity bilir', () => {
    const lead = freshLead();

    lead.contact(audit);
    lead.qualify(audit);

    const events = lead.getDomainEvents() as LeadStatusChangedEvent[];
    expect(events).toHaveLength(2);
    expect(events[0].previousStatus).toBe('NEW');
    expect(events[0].newStatus).toBe('CONTACTED');
    expect(events[1].previousStatus).toBe('CONTACTED');
    expect(events[1].newStatus).toBe('QUALIFIED');
  });

  it('aynı duruma geçiş event üretmez (idempotent çağrı)', () => {
    // Aynı statüye ikinci çağrı gürültü bir audit satırı yazmamalı:
    // "CONTACTED -> CONTACTED" denetim kaydında anlamsız.
    const lead = freshLead();

    lead.contact(audit);
    lead.contact(audit);

    expect(lead.getDomainEvents()).toHaveLength(1);
  });

  it('moveToStage statüyü değiştirmiyorsa event üretmez (OPEN→OPEN)', () => {
    const lead = freshLead();
    const stageName = 'Teklif';

    lead.moveToStage({
      pipelineId: randomUUID(),
      stageId: randomUUID(),
      stageType: 'OPEN',
      stageName,
      ...audit,
    });

    expect(lead.getDomainEvents()).toHaveLength(0);
  });

  it('moveToStage(WON) → LeadStatusChangedEvent, audit metni aşama adını taşır', () => {
    const lead = freshLead();

    lead.moveToStage({
      pipelineId: randomUUID(),
      stageId: randomUUID(),
      stageType: 'WON',
      stageName: 'Kazanıldı',
      ...audit,
    });

    const event = lead.getDomainEvents()[0] as LeadStatusChangedEvent;
    expect(event).toBeInstanceOf(LeadStatusChangedEvent);
    expect(event.previousStatus).toBe('NEW');
    expect(event.newStatus).toBe('CONVERTED');
    expect(event.log?.details).toContain('Kazanıldı');
  });
});
