import { BadRequestException } from '@nestjs/common';

import { TaxParameter } from './tax-parameter.entity';
import { TaxParameterKeySchema } from '@shared';

describe('TaxParameter entity', () => {
  const base = {
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    key: TaxParameterKeySchema.enum.VAT_HEALTH,
    rate: 10,
    validFrom: new Date('2026-01-01'),
  };

  describe('create', () => {
    it('geçerli props ile açık sürüm (validTo=null) oluşturur', () => {
      const p = TaxParameter.create(base);
      expect(p.id).toBeDefined();
      expect(p.key).toBe(TaxParameterKeySchema.enum.VAT_HEALTH);
      expect(p.rateNumber).toBe(10);
      expect(p.validTo).toBeNull();
    });

    it('0-100 dışı oranı reddeder', () => {
      expect(() => TaxParameter.create({ ...base, rate: 101 })).toThrow(
        BadRequestException
      );
      expect(() => TaxParameter.create({ ...base, rate: -1 })).toThrow(
        BadRequestException
      );
    });

    it('validTo <= validFrom ise reddeder', () => {
      expect(() =>
        TaxParameter.create({ ...base, validTo: new Date('2025-12-31') })
      ).toThrow(BadRequestException);
    });
  });

  describe('isEffectiveAt', () => {
    it('açık sürüm validFrom’dan itibaren her tarihte geçerli', () => {
      const p = TaxParameter.create(base);
      expect(p.isEffectiveAt(new Date('2026-06-01'))).toBe(true);
      expect(p.isEffectiveAt(new Date('2025-12-31'))).toBe(false);
    });

    it('kapatılmış sürüm yalnız [validFrom, validTo] aralığında geçerli', () => {
      const p = TaxParameter.create(base);
      p.close(new Date('2026-06-01'));
      expect(p.isEffectiveAt(new Date('2026-03-01'))).toBe(true);
      expect(p.isEffectiveAt(new Date('2026-07-01'))).toBe(false);
    });
  });

  describe('close', () => {
    it('açık sürümü kapatır', () => {
      const p = TaxParameter.create(base);
      p.close(new Date('2026-06-01'));
      expect(p.validTo).toEqual(new Date('2026-06-01'));
    });

    it('idempotent: ikinci close ilk değeri korur', () => {
      const p = TaxParameter.create(base);
      p.close(new Date('2026-06-01'));
      p.close(new Date('2026-08-01'));
      expect(p.validTo).toEqual(new Date('2026-06-01'));
    });

    it('validFrom öncesi kapanışı reddeder', () => {
      const p = TaxParameter.create(base);
      expect(() => p.close(new Date('2025-01-01'))).toThrow(
        BadRequestException
      );
    });
  });

  describe('toPersistence', () => {
    it('scalar Prisma şeklini döner', () => {
      const p = TaxParameter.create(base);
      const raw = p.toPersistence();
      expect(raw).toEqual(
        expect.objectContaining({
          id: p.id,
          clinicId: 'clinic-1',
          organizationId: 'org-1',
          key: TaxParameterKeySchema.enum.VAT_HEALTH,
          validTo: null,
        })
      );
      expect(raw.rate.toString()).toBe('10');
    });
  });
});
