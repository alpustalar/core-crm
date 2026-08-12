import { Decimal } from 'decimal.js';
import { ChargeTotalsCalculator } from './charge-totals.calculator';
import { TreatmentCharge } from '@modules/finance/treatment-charge/domain/entities/treatment-charge.entity';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import {
  ChargeCurrencyMismatchException,
  MixedVatRateException,
  NoChargesForAppointmentException,
} from '@modules/finance/treatment-charge/domain/exceptions/treatment-charge.exceptions';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

const IDS = {
  org: '11111111-1111-4111-8111-111111111111',
  clinic: '22222222-2222-4222-8222-222222222222',
  appointment: '33333333-3333-4333-8333-333333333333',
  patient: '44444444-4444-4444-8444-444444444444',
  treatment: '55555555-5555-4555-8555-555555555555',
};

interface LineInput {
  price: number | string;
  quantity?: number;
  discountRate?: number;
  vatRate?: number;
  currency?: CurrencyType;
}

const line = (input: LineInput): TreatmentCharge =>
  TreatmentCharge.create({
    organizationId: IDS.org,
    clinicId: IDS.clinic,
    appointmentId: IDS.appointment,
    patientId: IDS.patient,
    treatmentId: IDS.treatment,
    quantity: new Decimal(input.quantity ?? 1),
    listPrice: Money.create(input.price, input.currency ?? 'TRY').orThrow(),
    discountRate: new Decimal(input.discountRate ?? 0),
    vatRate: VatRate.create(input.vatRate ?? 20).orThrow(),
    maxDiscountPercent: new Decimal(100),
    canExceedDiscountLimit: true,
  });

describe('ChargeTotalsCalculator', () => {
  it('satır toplamları faturanın tutarını verir', () => {
    const summary = ChargeTotalsCalculator.summarize(IDS.appointment, [
      line({ price: 1000 }),
      line({ price: 500, quantity: 2 }),
    ]);

    expect(summary.listTotal).toBe('2000.00');
    expect(summary.netTotal).toBe('2000.00');
    expect(summary.vatTotal).toBe('400.00');
    expect(summary.grandTotal).toBe('2400.00');
    expect(summary.lineCount).toBe(2);
  });

  it('indirimler ayrı bir toplam olarak raporlanır', () => {
    const summary = ChargeTotalsCalculator.summarize(IDS.appointment, [
      line({ price: 1000, discountRate: 10 }),
      line({ price: 1000, discountRate: 50 }),
    ]);

    expect(summary.listTotal).toBe('2000.00');
    expect(summary.discountTotal).toBe('600.00');
    expect(summary.netTotal).toBe('1400.00');
    expect(summary.grandTotal).toBe('1680.00');
  });

  it('genel toplam satırların toplamına birebir eşittir (kuruş sapması yok)', () => {
    // Brütü yeniden matraha bölen yaklaşımın kuruş kaydırdığı klasik senaryo.
    const lines = [
      line({ price: '33.33' }),
      line({ price: '33.33' }),
      line({ price: '33.34' }),
    ];

    const summary = ChargeTotalsCalculator.summarize(IDS.appointment, lines);

    const manualGross = lines
      .reduce((sum, l) => sum.plus(l.grossAmount.value), new Decimal(0))
      .toFixed(2);

    expect(summary.grandTotal).toBe(manualGross);
    expect(
      new Decimal(summary.netTotal).plus(summary.vatTotal).toFixed(2)
    ).toBe(summary.grandTotal);
  });

  it('iptal edilmiş satırlar toplama girmez', () => {
    const voided = line({ price: 1000 });
    voided.void({ reason: 'yanlış giriş' });

    const summary = ChargeTotalsCalculator.summarize(IDS.appointment, [
      line({ price: 500 }),
      voided,
    ]);

    expect(summary.lineCount).toBe(1);
    expect(summary.netTotal).toBe('500.00');
  });

  it('aktif satır yoksa hata verir — boş fatura kesilmez', () => {
    const voided = line({ price: 100 });
    voided.void({ reason: 'iptal' });

    expect(() =>
      ChargeTotalsCalculator.summarize(IDS.appointment, [voided])
    ).toThrow(NoChargesForAppointmentException);
  });

  it('karışık KDV oranı reddedilir — fatura başlığı tek oran taşır', () => {
    expect(() =>
      ChargeTotalsCalculator.summarize(IDS.appointment, [
        line({ price: 100, vatRate: 20 }),
        line({ price: 100, vatRate: 10 }),
      ])
    ).toThrow(MixedVatRateException);
  });

  it('karışık para birimi reddedilir', () => {
    expect(() =>
      ChargeTotalsCalculator.summarize(IDS.appointment, [
        line({ price: 100, currency: 'TRY' }),
        line({ price: 100, currency: 'EUR' }),
      ])
    ).toThrow(ChargeCurrencyMismatchException);
  });
});
