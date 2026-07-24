import { Activity } from './activity.entity';
import { ActivityInvalidCompletionException } from '@modules/crm/activity/domain/exceptions/activity.exceptions';
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
    expect(activity.leadId).toBe(leadId);
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

  it('complete(NOTE) → ActivityInvalidCompletionException fırlatır', () => {
    const note = Activity.create({
      clinicId,
      organizationId,
      leadId,
      type: 'NOTE',
      subject: 'Görüşme notu',
    });

    expect(() => note.complete()).toThrow(ActivityInvalidCompletionException);
  });

  it('complete → zaten tamamlanmış aktivite tekrar tamamlanamaz', () => {
    const activity = Activity.create(baseProps());
    activity.complete();

    expect(() => activity.complete()).toThrow(
      ActivityInvalidCompletionException
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
