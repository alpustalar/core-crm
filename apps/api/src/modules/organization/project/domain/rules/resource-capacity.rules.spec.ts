import {
  checkCapacity,
  isExclusiveResource,
  normalizeAllocationPercent,
  rangesOverlap,
} from './resource-capacity.rules';
import { OverlappingAllocation } from '@modules/organization/project/domain/contracts/project.contracts';

describe('resource-capacity.rules (kaynak kapasite kuralı)', () => {
  const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

  const alloc = (
    percent: number,
    id = 'a1',
    projectId = 'p1'
  ): OverlappingAllocation => ({
    id,
    projectId,
    startDate: day('2026-09-01'),
    endDate: day('2026-09-30'),
    allocationPercent: percent,
  });

  describe('kaynak doğası', () => {
    it('oda ve cihaz bölünemez', () => {
      expect(isExclusiveResource('ROOM')).toBe(true);
      expect(isExclusiveResource('EQUIPMENT')).toBe(true);
    });

    it('personel bölünebilir', () => {
      expect(isExclusiveResource('EMPLOYEE')).toBe(false);
    });

    it('oda/cihazda yüzde daima 100 — istenen değer yok sayılır', () => {
      expect(normalizeAllocationPercent('ROOM', 30)).toBe(100);
      expect(normalizeAllocationPercent('EQUIPMENT', 1)).toBe(100);
    });

    it('personelde istenen yüzde korunur; verilmezse 100 kabul edilir', () => {
      expect(normalizeAllocationPercent('EMPLOYEE', 40)).toBe(40);
      expect(normalizeAllocationPercent('EMPLOYEE', undefined)).toBe(100);
    });
  });

  describe('personel (bölünebilir)', () => {
    it('çakışma yoksa geçer', () => {
      const verdict = checkCapacity({
        kind: 'EMPLOYEE',
        requestedPercent: 100,
        overlapping: [],
      });
      expect(verdict.ok).toBe(true);
    });

    it('toplam %100 ise geçer (tam dolduruş)', () => {
      const verdict = checkCapacity({
        kind: 'EMPLOYEE',
        requestedPercent: 40,
        overlapping: [alloc(60)],
      });
      expect(verdict).toEqual({ ok: true, allocatedPercent: 60 });
    });

    it('toplam %100 aşarsa reddeder ve çakışanları döndürür', () => {
      const verdict = checkCapacity({
        kind: 'EMPLOYEE',
        requestedPercent: 50,
        overlapping: [alloc(60)],
      });
      expect(verdict.ok).toBe(false);
      if (!verdict.ok) {
        expect(verdict.allocatedPercent).toBe(60);
        expect(verdict.conflicts).toHaveLength(1);
      }
    });

    it('birden çok mevcut tahsis toplanır', () => {
      const verdict = checkCapacity({
        kind: 'EMPLOYEE',
        requestedPercent: 20,
        overlapping: [alloc(50, 'a1'), alloc(40, 'a2', 'p2')],
      });
      expect(verdict.ok).toBe(false);
      if (!verdict.ok) expect(verdict.allocatedPercent).toBe(90);
    });
  });

  describe('oda/cihaz (bölünemez)', () => {
    it('tek bir çakışma bile reddedilir — yüzde bakılmaz', () => {
      const verdict = checkCapacity({
        kind: 'ROOM',
        requestedPercent: 100,
        overlapping: [alloc(1)],
      });
      expect(verdict.ok).toBe(false);
    });

    it('çakışma yoksa geçer', () => {
      const verdict = checkCapacity({
        kind: 'EQUIPMENT',
        requestedPercent: 100,
        overlapping: [],
      });
      expect(verdict).toEqual({ ok: true, allocatedPercent: 0 });
    });
  });

  describe('aralık örtüşmesi (uç günler dahil)', () => {
    it('bitiş günü ile ertesi başlangıç aynı gün ise çakışır', () => {
      expect(
        rangesOverlap(
          day('2026-09-01'),
          day('2026-09-10'),
          day('2026-09-10'),
          day('2026-09-20')
        )
      ).toBe(true);
    });

    it('bir gün boşluk varsa çakışmaz', () => {
      expect(
        rangesOverlap(
          day('2026-09-01'),
          day('2026-09-10'),
          day('2026-09-11'),
          day('2026-09-20')
        )
      ).toBe(false);
    });

    it('tamamen kapsayan aralık çakışır', () => {
      expect(
        rangesOverlap(
          day('2026-09-01'),
          day('2026-09-30'),
          day('2026-09-10'),
          day('2026-09-12')
        )
      ).toBe(true);
    });
  });
});
