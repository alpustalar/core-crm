import { TreatmentPackage } from './treatment-package.entity';
import {
  TreatmentPackageCreatedEvent,
  TreatmentPackageDeletedEvent,
  TreatmentPackageUpdatedEvent,
} from '@modules/clinical/treatment-package/domain/events';
import {
  CreateTreatmentPackageProps,
  CreateTreatmentPackageSchema,
} from '@modules/clinical/treatment-package/domain/contracts/treatment-package.contracts';
import { Money } from '@src/domain/value-objects/money.vo';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';

describe('TreatmentPackage entity', () => {
  const CLINIC_ID = '11111111-1111-4111-8111-111111111111';

  const baseProps: CreateTreatmentPackageProps = {
    clinicId: CLINIC_ID,
    name: '  Saç Ekimi Paketi  ',
    examinationCount: 2,
    controlCount: 3,
    validityDays: 365,
    price: Money.create(15000, 'TRY').orThrow(),
    providerIds: ['prov-1', 'prov-2'],
    items: [{ treatmentId: 'trt-1', count: 4 }],
  };

  describe('create', () => {
    it('aktif paket üretir, id atar ve created event fırlatır', () => {
      const pkg = TreatmentPackage.create(baseProps);

      expect(pkg.id).toBeDefined();
      expect(pkg.name).toBe('  Saç Ekimi Paketi  '); // trim artık entity'de yapılmıyor (şema katmanına taşındı)
      expect(pkg.isActive).toBe(true);
      expect(pkg.validate.isDeleted.value).toBe(false);
      expect(pkg.price.value.toNumber()).toBe(15000);
      expect(pkg.totalSessionCount).toBe(5); // examination + control

      // İlişki yazma niyeti create'te her zaman set edilir
      expect(pkg.providerIdsToSync).toEqual(['prov-1', 'prov-2']);
      expect(pkg.itemsToSync).toEqual([{ treatmentId: 'trt-1', count: 4 }]);

      const events = pkg.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TreatmentPackageCreatedEvent);
      expect((events[0] as TreatmentPackageCreatedEvent).packageId).toBe(
        pkg.id.value
      );
      expect((events[0] as TreatmentPackageCreatedEvent).clinicId).toBe(
        CLINIC_ID
      );
    });

    it('ilişkiler verilmezse boş dizi olarak senkronlanır', () => {
      const pkg = TreatmentPackage.create({
        ...baseProps,
        providerIds: undefined,
        items: undefined,
      });
      expect(pkg.providerIdsToSync).toEqual([]);
      expect(pkg.itemsToSync).toEqual([]);
    });

    it('boş isim reddedilir (şema katmanı)', () => {
      // İsim boşluğu validasyonu artık entity'de değil, CreateTreatmentPackageSchema'da (DTO sınırında).
      expect(() =>
        CreateTreatmentPackageSchema.parse({ ...baseProps, name: '' })
      ).toThrow('Paket adı zorunludur');
    });

    it('negatif fiyat reddedilir (Money katmanı)', () => {
      // Money migration sonrası negatiflik Money VO'da reddedilir (entity'ye ulaşmaz).
      expect(() => Money.validate.input(-1, 'TRY').orThrow()).toThrow(
        'Para miktarı negatif olamaz.'
      );
    });
  });

  describe('update', () => {
    it('sadece verilen alanları değiştirir ve updated event fırlatır', () => {
      const pkg = TreatmentPackage.create(baseProps);
      pkg.clearDomainEvents(); // create event'ini ayıkla

      pkg.update({ name: 'Yeni İsim', price: Money.create(20000, 'TRY').orThrow() });

      expect(pkg.name).toBe('Yeni İsim');
      expect(pkg.price.value.toNumber()).toBe(20000);
      expect(pkg.validityDays).toBe(365); // dokunulmadı

      const events = pkg.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TreatmentPackageUpdatedEvent);
    });

    it('ilişki write-intent yalnızca alan verildiğinde set edilir', () => {
      const pkg = TreatmentPackage.create(baseProps);

      // Sadece isim güncellenince ilişkilere dokunma
      pkg.update({ name: 'X' });
      expect(pkg.providerIdsToSync).toEqual(['prov-1', 'prov-2']); // create'ten kalan, değişmedi

      // providerIds explicit verilince değişir
      pkg.update({ providerIds: ['prov-9'] });
      expect(pkg.providerIdsToSync).toEqual(['prov-9']);
    });

    it('silinmiş paket güncellenemez (rules katmanı)', () => {
      // update() artık kendi içinde kontrol etmiyor; kural handler'da rules() üzerinden uygulanır.
      const pkg = TreatmentPackage.create(baseProps);
      pkg.softDelete();
      expect(() =>
        pkg.rules(DefaultValidateOptions).update({ name: 'X' }).orThrow()
      ).toThrow('Silinmiş tedavi paketi güncellenemez.');
    });
  });

  describe('softDelete', () => {
    it('deletedAt + isActive false set eder ve deleted event fırlatır', () => {
      const pkg = TreatmentPackage.create(baseProps);
      pkg.clearDomainEvents();

      pkg.softDelete();

      expect(pkg.validate.isDeleted.value).toBe(true);
      expect(pkg.deletedAt).toBeInstanceOf(Date);
      expect(pkg.isActive).toBe(false);

      const events = pkg.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TreatmentPackageDeletedEvent);
    });

    it('idempotent: ikinci softDelete event üretmez', () => {
      const pkg = TreatmentPackage.create(baseProps);
      pkg.softDelete();
      const firstDeletedAt = pkg.deletedAt;
      pkg.clearDomainEvents();

      pkg.softDelete();

      expect(pkg.deletedAt).toBe(firstDeletedAt); // değişmedi
      expect(pkg.getDomainEvents()).toHaveLength(0); // yeni event yok
    });
  });
});
