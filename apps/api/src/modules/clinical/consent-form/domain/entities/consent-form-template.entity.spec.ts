import { ConsentFormTemplate } from './consent-form-template.entity';
import { ConsentTemplateAlreadyArchivedException } from '@modules/clinical/consent-form/domain/exceptions/consent-form.exceptions';
import { randomUUID } from 'crypto';

describe('ConsentFormTemplate entity', () => {
  const organizationId = randomUUID();
  const clinicId = randomUUID();
  const createdByUserId = randomUUID();

  const baseProps = () => ({
    organizationId,
    clinicId,
    title: 'Genel Anestezi Onam Formu',
    content: 'Bu formu okuyup imzalayarak ... kabul ediyorum.',
    createdByUserId,
  });

  it('create → version=1, isActive=true, updatedByUserId null', () => {
    const template = ConsentFormTemplate.create(baseProps());

    expect(template.id.value).toBeDefined();
    expect(template.version).toBe(1);
    expect(template.isActive).toBe(true);
    expect(template.updatedByUserId).toBeNull();
    expect(template.sectorId).toBeNull();
  });

  it('update → title/content değişince version artar', () => {
    const template = ConsentFormTemplate.create(baseProps());
    const updaterId = randomUUID();

    template.update({
      title: 'Güncellenmiş Onam Formu',
      updatedByUserId: updaterId,
    });

    expect(template.version).toBe(2);
    expect(template.title).toBe('Güncellenmiş Onam Formu');
    expect(template.updatedByUserId).toBe(updaterId);
  });

  it('update → sadece sectorId değişince version DEĞİŞMEZ', () => {
    const template = ConsentFormTemplate.create(baseProps());
    const sectorId = randomUUID();
    const updaterId = randomUUID();

    template.update({ sectorId, updatedByUserId: updaterId });

    expect(template.version).toBe(1); // kritik iş kuralı
    expect(template.sectorId?.value).toBe(sectorId);
  });

  it('update → aynı title tekrar gönderilirse version artmaz', () => {
    const template = ConsentFormTemplate.create(baseProps());
    const updaterId = randomUUID();

    template.update({ title: baseProps().title, updatedByUserId: updaterId });

    expect(template.version).toBe(1);
  });

  it('archive → isActive=false', () => {
    const template = ConsentFormTemplate.create(baseProps());

    template.archive();

    expect(template.isActive).toBe(false);
    expect(template.isArchived()).toBe(true);
  });

  it('archive → zaten arşivli şablon tekrar arşivlenemez', () => {
    const template = ConsentFormTemplate.create(baseProps());
    template.archive();

    expect(() => template.archive()).toThrow(
      ConsentTemplateAlreadyArchivedException
    );
  });

  it('toPersistence düz shape döner', () => {
    const template = ConsentFormTemplate.create(baseProps());
    const raw = template.toPersistence();

    expect(raw.id).toBe(template.id.value);
    expect(raw.organizationId).toBe(organizationId);
    expect(raw.clinicId).toBe(clinicId);
    expect(raw.version).toBe(1);
    expect(raw.isActive).toBe(true);
  });
});
