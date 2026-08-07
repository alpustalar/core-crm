import { Decimal } from 'decimal.js';
import { Project } from './project.entity';
import { ProjectInvalidStateException } from '@modules/organization/project/domain/exceptions/project.exceptions';

describe('Project entity (durum makinesi)', () => {
  const clinicId = '11111111-1111-4111-8111-111111111111';
  const orgId = '22222222-2222-4222-8222-222222222222';
  const ownerId = '33333333-3333-4333-8333-333333333333';

  const make = () =>
    Project.create({
      clinicId,
      organizationId: orgId,
      name: 'Yeni şube açılışı',
      ownerId,
      createdById: ownerId,
      budget: new Decimal('250000.00'),
    });

  it('PLANNING durumunda doğar', () => {
    expect(make().status).toBe('PLANNING');
  });

  it('PLANNING → ACTIVE → ON_HOLD → ACTIVE → COMPLETED yolu açık', () => {
    const project = make();
    project.activate();
    expect(project.status).toBe('ACTIVE');
    project.putOnHold();
    expect(project.status).toBe('ON_HOLD');
    project.activate();
    project.complete();
    expect(project.status).toBe('COMPLETED');
    expect(project.completedAt).not.toBeNull();
  });

  it('PLANNING durumundan doğrudan tamamlanamaz', () => {
    expect(() => make().complete()).toThrow(ProjectInvalidStateException);
  });

  it('askıdaki proje tamamlanamaz — önce aktifleştirilmeli', () => {
    const project = make();
    project.activate();
    project.putOnHold();
    expect(() => project.complete()).toThrow(ProjectInvalidStateException);
  });

  it('tamamlanmış proje terminaldir — hiçbir geçiş kabul etmez', () => {
    const project = make();
    project.activate();
    project.complete();
    expect(() => project.putOnHold()).toThrow(ProjectInvalidStateException);
    expect(() => project.cancel('gerekçe')).toThrow(
      ProjectInvalidStateException
    );
  });

  it('iptal her aşamadan mümkün ve gerekçeyi saklar', () => {
    const project = make();
    project.activate();
    project.cancel('bütçe onaylanmadı');
    expect(project.status).toBe('CANCELLED');
    expect(project.cancelReason).toBe('bütçe onaylanmadı');
    expect(project.cancelledAt).not.toBeNull();
  });

  it('terminal projeye iş eklenemez', () => {
    const project = make();
    project.cancel('vazgeçildi');
    expect(() => project.assertAcceptsWork('görev ekleme')).toThrow(
      ProjectInvalidStateException
    );
  });

  it('terminal proje güncellenemez', () => {
    const project = make();
    project.cancel('vazgeçildi');
    expect(() => project.updateDetails({ name: 'yeni ad' })).toThrow(
      ProjectInvalidStateException
    );
  });

  it('güncelleme durum ve tarihçeye dokunmaz', () => {
    const project = make();
    project.activate();
    project.updateDetails({ name: 'Şube açılışı v2' });
    expect(project.name).toBe('Şube açılışı v2');
    expect(project.status).toBe('ACTIVE');
    expect(project.completedAt).toBeNull();
  });

  it('null gönderilen nullable alan temizlenir, undefined dokunmaz', () => {
    const project = make();
    project.updateDetails({ budget: null });
    expect(project.budget).toBeNull();
    project.updateDetails({ name: 'x' });
    expect(project.budget).toBeNull();
  });

  it('changeStatus PLANNING hedefini reddeder (geri dönüş yok)', () => {
    const project = make();
    project.activate();
    expect(() => project.changeStatus('PLANNING')).toThrow(
      ProjectInvalidStateException
    );
  });
});
