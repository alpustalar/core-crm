import { Decimal } from 'decimal.js';
import {
  DEFAULT_MATCH_OPTIONS,
  findBestMatch,
  LedgerCandidate,
  MatchableStatementLine,
  scoreCandidate,
} from './statement-line-matcher';

describe('statement-line-matcher (banka oto-eşleştirme motoru)', () => {
  const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

  function line(
    overrides: Partial<MatchableStatementLine> = {}
  ): MatchableStatementLine {
    return {
      id: 'line-1',
      transactionDate: day('2026-06-10'),
      amount: new Decimal('1500.00'), // giriş
      description: 'GELEN HAVALE',
      reference: null,
      counterpartyName: null,
      ...overrides,
    };
  }

  function candidate(
    overrides: Partial<LedgerCandidate> = {}
  ): LedgerCandidate {
    return {
      lineId: 'jl-1',
      entryId: 'je-1',
      entryNo: 12n,
      entryDate: day('2026-06-10'),
      entryDescription: 'Tahsilat',
      lineDesc: null,
      debit: new Decimal('1500.00'),
      credit: new Decimal('0'),
      ...overrides,
    };
  }

  describe('zorunlu filtreler', () => {
    it('tutar birebir eşleşmiyorsa aday elenir (kuruş farkı ayrı işlemdir)', () => {
      expect(
        scoreCandidate(line(), candidate({ debit: new Decimal('1500.01') }))
      ).toBeNull();
    });

    it('yön ters ise elenir — banka girişi alacak satırıyla eşleşmez', () => {
      const outflowCandidate = candidate({
        debit: new Decimal('0'),
        credit: new Decimal('1500.00'),
      });
      expect(scoreCandidate(line(), outflowCandidate)).toBeNull();
    });

    it('banka çıkışı (negatif tutar) alacak satırıyla eşleşir', () => {
      const outflowLine = line({ amount: new Decimal('-1500.00') });
      const outflowCandidate = candidate({
        debit: new Decimal('0'),
        credit: new Decimal('1500.00'),
      });
      expect(scoreCandidate(outflowLine, outflowCandidate)).not.toBeNull();
    });

    it('tarih toleransı dışındaki aday elenir', () => {
      const far = candidate({ entryDate: day('2026-06-20') });
      expect(scoreCandidate(line(), far)).toBeNull();
    });

    it('tolerans sınırındaki aday kabul edilir', () => {
      const edge = candidate({ entryDate: day('2026-06-13') }); // 3 gün
      const scored = scoreCandidate(line(), edge);
      expect(scored).not.toBeNull();
      expect(scored!.dayDifference).toBe(
        DEFAULT_MATCH_OPTIONS.dateToleranceDays
      );
    });
  });

  describe('puanlama', () => {
    it('aynı gün, uzak güne göre daha yüksek puan alır', () => {
      const sameDay = scoreCandidate(line(), candidate())!;
      const twoDays = scoreCandidate(
        line(),
        candidate({ lineId: 'jl-2', entryDate: day('2026-06-12') })
      )!;
      expect(sameDay.score).toBeGreaterThan(twoDays.score);
      expect(sameDay.reasons).toContain('SAME_DAY');
    });

    it('referans metni fiş açıklamasında geçiyorsa puan artar', () => {
      const withRef = line({ reference: 'FT2026-441' });
      const plain = scoreCandidate(withRef, candidate())!;
      const matching = scoreCandidate(
        withRef,
        candidate({ entryDescription: 'Tahsilat FT2026-441' })
      )!;
      expect(matching.score).toBeGreaterThan(plain.score);
      expect(matching.reasons).toContain('REFERENCE_IN_TEXT');
    });

    it('karşı taraf adı Türkçe büyük/küçük harf farkına takılmaz', () => {
      const withParty = line({ counterpartyName: 'IŞIL DİŞ' });
      const scored = scoreCandidate(
        withParty,
        candidate({ entryDescription: 'Havale - ışıl diş' })
      )!;
      expect(scored.reasons).toContain('COUNTERPARTY_IN_TEXT');
    });

    it('çok kısa referans (≤2 karakter) metin sinyali saymaz', () => {
      const shortRef = line({ reference: 'AB' });
      const scored = scoreCandidate(
        shortRef,
        candidate({ entryDescription: 'ab cd' })
      )!;
      expect(scored.reasons).not.toContain('REFERENCE_IN_TEXT');
    });
  });

  describe('findBestMatch — makine tahmin etmez', () => {
    it('tek aday varsa eşleştirir', () => {
      const result = findBestMatch(line(), [candidate()]);
      expect(result.kind).toBe('MATCHED');
    });

    it('aday yoksa NONE döner', () => {
      const result = findBestMatch(line(), [
        candidate({ debit: new Decimal('999') }),
      ]);
      expect(result.kind).toBe('NONE');
    });

    it('aynı tutar + aynı gün iki aday → AMBIGUOUS (kura çekilmez)', () => {
      const result = findBestMatch(line(), [
        candidate({ lineId: 'jl-1' }),
        candidate({ lineId: 'jl-2', entryId: 'je-2' }),
      ]);
      expect(result.kind).toBe('AMBIGUOUS');
      if (result.kind === 'AMBIGUOUS') {
        expect(result.candidates).toHaveLength(2);
      }
    });

    it('iki adaydan biri kesin üstünse (metin sinyali) onu seçer', () => {
      const withRef = line({ reference: 'FT2026-441' });
      const result = findBestMatch(withRef, [
        candidate({ lineId: 'jl-1' }),
        candidate({
          lineId: 'jl-2',
          entryId: 'je-2',
          entryDescription: 'Tahsilat FT2026-441',
        }),
      ]);
      expect(result.kind).toBe('MATCHED');
      if (result.kind === 'MATCHED') {
        expect(result.best.candidate.lineId).toBe('jl-2');
      }
    });

    it('aynı tutarlı iki adaydan tarihi yakın olan seçilir', () => {
      const result = findBestMatch(line(), [
        candidate({ lineId: 'jl-far', entryDate: day('2026-06-13') }),
        candidate({ lineId: 'jl-near', entryId: 'je-2' }),
      ]);
      expect(result.kind).toBe('MATCHED');
      if (result.kind === 'MATCHED') {
        expect(result.best.candidate.lineId).toBe('jl-near');
      }
    });
  });
});
