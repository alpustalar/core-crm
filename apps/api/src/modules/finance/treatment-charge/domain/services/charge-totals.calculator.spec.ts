import { Decimal } from 'decimal.js';
import { randomUUID } from 'crypto';
import { ChargeTotalsCalculator } from './charge-totals.calculator';
import { TreatmentCharge } from '@modules/finance/treatment-charge/domain/entities/treatment-charge.entity';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';

/**
 * Özet, faturanın gövdesini üretiyor. Kolonlarının kendi içinde tutarlı olması
 * ("liste − indirim = matrah", "matrah + KDV = brüt") pazarlık konusu değil:
 * tutmazsa fatura üstünde gözle görülür bir kuruş farkı çıkar.
 */
describe('ChargeTotalsCalculator — özet kolonları kendi içinde tutarlı', () => {
  const clinicId = randomUUID();
  const patientId = randomUUID();
  const appointmentId = randomUUID();
  const organizationId = randomUUID();
  const treatmentId = randomUUID();

  /**
   * DB gidiş-dönüşü. Parasal kolonlar `Decimal(x,2)`; repo `create`/`find*`
   * her zaman DB satırından yeniden kurduğu için özet **yuvarlanmış** değerleri
   * toplar. Bellekteki taze entity ile test etmek hatayı gizler — asıl tutarsızlık
   * "saklanan 2 haneli matrah" ile "her okumada hesaplanan liste tutarı"
   * arasında doğuyor.
   */
  const reload = (charge: TreatmentCharge): TreatmentCharge => {
    const row = charge.toPersistence();
    return new TreatmentCharge({
      ...row,
      discountAmount: row.discountAmount.toDecimalPlaces(2),
      netAmount: row.netAmount.toDecimalPlaces(2),
      vatAmount: row.vatAmount.toDecimalPlaces(2),
      grossAmount: row.grossAmount.toDecimalPlaces(2),
    });
  };

  const makeCharge = (input: {
    listPrice: string;
    quantity: string;
    discountRate: string;
    vatRate: number;
  }) =>
    TreatmentCharge.create({
      organizationId,
      clinicId,
      appointmentId,
      patientId,
      treatmentId,
      quantity: new Decimal(input.quantity),
      listPrice: Money.create(input.listPrice, 'TRY').orThrow(),
      discountRate: new Decimal(input.discountRate),
      vatRate: VatRate.create(input.vatRate).orThrow(),
      maxDiscountPercent: new Decimal(100),
      canExceedDiscountLimit: true,
    });

  /**
   * Regresyon: adet kesirli (`Decimal(10,3)`) olabildiği için 45.55 × 2.5 =
   * 113.875 idi. İndirim ve matrah 2 haneye yuvarlanıp saklanırken liste tutarı
   * her okumada ham çarpımdan hesaplanıyordu → iki satırda özet
   * "227.75 − 34.16 = 193.59" derken matrah 193.60 yazıyordu.
   */
  it('kesirli adette liste − indirim = matrah (kuruş kaymaz)', () => {
    const charges = [
      makeCharge({
        listPrice: '45.55',
        quantity: '2.5',
        discountRate: '15',
        vatRate: 10,
      }),
      makeCharge({
        listPrice: '45.55',
        quantity: '2.5',
        discountRate: '15',
        vatRate: 10,
      }),
    ];

    const summary = ChargeTotalsCalculator.summarize(
      appointmentId,
      charges.map(reload)
    );

    expect(
      new Decimal(summary.listTotal).minus(summary.discountTotal).toFixed(2)
    ).toBe(summary.netTotal);
  });

  it('matrah + KDV = brüt', () => {
    const charges = [
      makeCharge({
        listPrice: '33.33',
        quantity: '1.5',
        discountRate: '0',
        vatRate: 20,
      }),
    ];

    const summary = ChargeTotalsCalculator.summarize(
      appointmentId,
      charges.map(reload)
    );

    expect(
      new Decimal(summary.netTotal).plus(summary.vatTotal).toFixed(2)
    ).toBe(summary.grandTotal);
  });

  it('tam sayı adette davranış değişmez', () => {
    const charges = [
      makeCharge({
        listPrice: '1000.00',
        quantity: '2',
        discountRate: '10',
        vatRate: 20,
      }),
    ];

    const summary = ChargeTotalsCalculator.summarize(
      appointmentId,
      charges.map(reload)
    );

    expect(summary.listTotal).toBe('2000.00');
    expect(summary.discountTotal).toBe('200.00');
    expect(summary.netTotal).toBe('1800.00');
    expect(summary.vatTotal).toBe('360.00');
    expect(summary.grandTotal).toBe('2160.00');
  });
});
