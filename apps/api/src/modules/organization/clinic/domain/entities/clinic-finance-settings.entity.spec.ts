import { Decimal } from 'decimal.js';
import { randomUUID } from 'crypto';
import { ClinicFinanceSettings } from './clinic-finance-settings.entity';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';

describe('ClinicFinanceSettings', () => {
  const clinicId = randomUUID();

  it('createDefault → DB default değerleriyle VO zırhlı ayar üretir', () => {
    const s = ClinicFinanceSettings.createDefault(clinicId);

    expect(s.defaultCurrency).toBeInstanceOf(Currency);
    expect(s.defaultCurrency.value).toBe('TRY');
    expect(s.defaultVatRate).toBeInstanceOf(VatRate);
    expect(s.defaultVatRate.value.toNumber()).toBe(20);
    expect(s.invoicePrefix).toBe('KLN');
    expect(s.roundingType).toBe('NONE');
    expect(s.providerPayoutTrigger).toBe('ON_PAYMENT');
    expect(s.maxNegativeBalanceAmount.toNumber()).toBe(0);
  });

  it('toPersistence → düz shape döner (VO değil), defaultVatRate Decimal', () => {
    const raw = ClinicFinanceSettings.createDefault(clinicId).toPersistence();
    expect(raw.defaultCurrency).toBe('TRY');
    expect(raw.defaultVatRate).toBeInstanceOf(Decimal);
    expect(raw.clinicId).toBe(clinicId);
  });

  it('geçersiz mali yıl ayı (13) → hata', () => {
    expect(() =>
      ClinicFinanceSettings.create({ clinicId, fiscalYearStartMonth: 13 })
    ).toThrow();
  });

  it('taksit sayısı 0 → hata', () => {
    expect(() =>
      ClinicFinanceSettings.create({ clinicId, maxInstallmentCount: 0 })
    ).toThrow();
  });

  it('negatif borç limiti → hata', () => {
    expect(() =>
      ClinicFinanceSettings.create({
        clinicId,
        maxNegativeBalanceAmount: new Decimal(-5),
      })
    ).toThrow();
  });

  it('geçersiz KDV oranı (%17) → VatRate VO reddeder', () => {
    expect(() =>
      ClinicFinanceSettings.create({
        clinicId,
        defaultVatRate: new Decimal(17),
      })
    ).toThrow();
  });
});
