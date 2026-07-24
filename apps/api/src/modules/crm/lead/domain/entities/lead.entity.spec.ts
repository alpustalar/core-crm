import { Lead } from './lead.entity';
import { LeadCreatedEvent } from '@modules/crm/lead/domain/events';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { randomUUID } from 'crypto';

describe('Lead entity — attribution alanları', () => {
  const clinicId = randomUUID();
  const organizationId = randomUUID();

  it('create → getter\'lar ve toPersistence attribution\'ı taşır (reklam)', () => {
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
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL', pipelineId, stageId });
    const targetStage = randomUUID();

    lead.moveToStage({ pipelineId, stageId: targetStage, stageType: 'OPEN' });

    expect(lead.stageId).toBe(targetStage);
    expect(lead.status).toBe('NEW');
    expect(lead.convertedAt).toBeNull();
    expect(lead.lostAt).toBeNull();
  });

  it('moveToStage(WON) → status CONVERTED + convertedAt set', () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL', pipelineId, stageId });
    const wonStage = randomUUID();

    lead.moveToStage({ pipelineId, stageId: wonStage, stageType: 'WON' });

    expect(lead.status).toBe('CONVERTED');
    expect(lead.stageId).toBe(wonStage);
    expect(lead.convertedAt).toBeInstanceOf(Date);
    expect(lead.lostAt).toBeNull();
  });

  it('moveToStage(LOST) → status LOST + lostReason + lostAt set', () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL', pipelineId, stageId });
    const lostStage = randomUUID();

    lead.moveToStage({
      pipelineId,
      stageId: lostStage,
      stageType: 'LOST',
      reason: 'Bütçe yetersiz',
    });

    expect(lead.status).toBe('LOST');
    expect(lead.lostReason).toBe('Bütçe yetersiz');
    expect(lead.lostAt).toBeInstanceOf(Date);
    expect(lead.convertedAt).toBeNull();
  });

  it('moveToStage: terminalden (LOST) OPEN aşamaya geri → QUALIFIED olarak reaktive olur', () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL', pipelineId, stageId });
    lead.moveToStage({ pipelineId, stageId: randomUUID(), stageType: 'LOST' });
    expect(lead.status).toBe('LOST');

    const reopenStage = randomUUID();
    lead.moveToStage({ pipelineId, stageId: reopenStage, stageType: 'OPEN' });

    expect(lead.status).toBe('QUALIFIED');
    expect(lead.stageId).toBe(reopenStage);
    expect(lead.lostAt).toBeNull();
    expect(lead.lostReason).toBeNull();
  });

  it('assignStage → yalnız pipelineId/stageId atar, status\'a dokunmaz', () => {
    const lead = Lead.create({ clinicId, organizationId, source: 'MANUAL' });
    const p = randomUUID();
    const s = randomUUID();

    lead.assignStage({ pipelineId: p, stageId: s });

    expect(lead.pipelineId).toBe(p);
    expect(lead.stageId).toBe(s);
    expect(lead.status).toBe('NEW');
  });
});
