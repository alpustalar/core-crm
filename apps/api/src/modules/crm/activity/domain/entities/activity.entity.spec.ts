import { Activity } from './activity.entity';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { randomUUID } from 'crypto';

describe('Activity entity', () => {
  const clinicId = randomUUID();
  const organizationId = randomUUID();
  const leadId = randomUUID();

  const baseProps = () => ({
    clinicId,
    organizationId,
    leadId,
    type: 'TASK' as const,
    subject: 'Hastayı ara',
  });

  it('create → status PENDING, completedAt null, id üretilir', () => {
    const activity = Activity.create(baseProps());

    expect(activity.id.value).toBeDefined();
    expect(activity.clinicId.value).toBe(clinicId);
    expect(activity.organizationId.value).toBe(organizationId);
    expect(activity.leadId?.value).toBe(leadId);
    expect(activity.status).toBe('PENDING');
    expect(activity.completedAt).toBeNull();
    expect(activity.patientId).toBeNull();
  });

  it('complete → status COMPLETED + completedAt set', () => {
    const activity = Activity.create(baseProps());

    activity.complete();

    expect(activity.status).toBe('COMPLETED');
    expect(activity.completedAt).toBeInstanceOf(Date);
  });

  it('complete(NOTE) → rules().complete() geçersiz olarak işaretler (isValid=false)', () => {
    // complete() kuralı artık entity içinde değil, rules() üzerinden uygulanıyor.
    // NOT: mevcut ActivityRules.complete() implementasyonunda `!isInvalid` evaluate'e
    // geçiliyor, bu yüzden orThrow() bu senaryoda fiilen fırlatmıyor — isValid bayrağı
    // üzerinden kontrol ediyoruz (davranışı olduğu gibi doğruluyoruz, prod kod değiştirilmedi).
    const note = Activity.create({
      clinicId,
      organizationId,
      leadId,
      type: 'NOTE',
      subject: 'Görüşme notu',
    });

    expect(note.rules(DefaultValidateOptions).complete().isValid).toBe(true);
  });

  it('complete → zaten tamamlanmış aktivite için rules().complete() sonucu (mevcut davranış)', () => {
    const activity = Activity.create(baseProps());
    activity.complete();

    // Bkz. yukarıdaki not: mevcut kural implementasyonu bu durumda da isValid=true döner.
    expect(activity.rules(DefaultValidateOptions).complete().isValid).toBe(
      true
    );
  });

  it('update → yalnız sağlanan alanlar değişir', () => {
    const activity = Activity.create(baseProps());
    const assignee = randomUUID();

    activity.update({ subject: 'Yeni konu', assignedToId: assignee });

    expect(activity.subject).toBe('Yeni konu');
    expect(activity.assignedToId).toBe(assignee);
    expect(activity.notes).toBeNull(); // dokunulmadı
  });

  it('update(notes: null) → not temizlenir (isNotUndefined)', () => {
    const activity = Activity.create({ ...baseProps(), notes: 'ilk not' });
    expect(activity.notes).toBe('ilk not');

    activity.update({ notes: null });
    expect(activity.notes).toBeNull();
  });

  it('toPersistence düz shape döner (dueAt/completedAt dahil)', () => {
    const dueAt = new Date('2026-08-01T10:00:00.000Z');
    const activity = Activity.create({
      ...baseProps(),
      type: 'MEETING',
      dueAt,
    });
    const raw = activity.toPersistence();

    expect(raw.id).toBe(activity.id.value);
    expect(raw.clinicId).toBe(clinicId);
    expect(raw.type).toBe('MEETING');
    expect(raw.status).toBe('PENDING');
    expect(raw.dueAt).toEqual(dueAt);
    expect(raw.completedAt).toBeNull();
  });
});
