import { Decimal } from 'decimal.js';
import { TreatmentCharge } from './treatment-charge.entity';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { CreateTreatmentChargeProps } from '@modules/finance/treatment-charge/domain/contracts/treatment-charge';
import {
  DiscountLimitExceededException,
  TreatmentChargeAlreadyVoidedException,
} from '@modules/finance/treatment-charge/domain/exceptions/treatment-charge.exceptions';

const IDS = {
  org: '11111111-1111-4111-8111-111111111111',
  clinic: '22222222-2222-4222-8222-222222222222',
  appointment: '33333333-3333-4333-8333-333333333333',
  patient: '44444444-4444-4444-8444-444444444444',
  treatment: '55555555-5555-4555-8555-555555555555',
};

type Overrides = Partial<CreateTreatmentChargeProps>;

const chargeOf = (overrides: Overrides = {}): TreatmentCharge =>
  TreatmentCharge.create({
    organizationId: IDS.org,
    clinicId: IDS.clinic,
    appointmentId: IDS.appointment,
    patientId: IDS.patient,
    treatmentId: IDS.treatment,
    quantity: new Decimal(1),
    listPrice: Money.create(1000, 'TRY').orThrow(),
    discountRate: new Decimal(0),
    vatRate: VatRate.create(20).orThrow(),
    maxDiscountPercent: new Decimal(20),
    canExceedDiscountLimit: false,
    createdById: 'user-1',
    ...overrides,
  });

describe('TreatmentCharge — tutar hesabı', () => {
  it('indirimsiz satırda net = liste × adet, KDV net üzerinden hesaplanır', () => {
    const charge = chargeOf({ quantity: new Decimal(2) });

    expect(charge.netAmount.value.toFixed(2)).toBe('2000.00');
    expect(charge.vatAmount.value.toFixed(2)).toBe('400.00');
    expect(charge.grossAmount.value.toFixed(2)).toBe('2400.00');
    expect(charge.discountAmount.value.toFixed(2)).toBe('0.00');
  });

  it('KDV indirimli tutar üzerinden doğar — önce indirim, sonra vergi', () => {
    // 1000 TL, %10 indirim -> matrah 900, KDV %20 -> 180, genel toplam 1080.
    // (Yanlış sıra — önce KDV sonra indirim — 1080 yerine 1080'e yakın ama
    // matrahı 1000 bırakıp beyanı bozardı.)
    const charge = chargeOf({ discountRate: new Decimal(10) });

    expect(charge.discountAmount.value.toFixed(2)).toBe('100.00');
    expect(charge.netAmount.value.toFixed(2)).toBe('900.00');
    expect(charge.vatAmount.value.toFixed(2)).toBe('180.00');
    expect(charge.grossAmount.value.toFixed(2)).toBe('1080.00');
  });

  it('liste fiyatı satıra donar — tedavi zammı geçmiş satırı etkilemez', () => {
    const charge = chargeOf();
    expect(charge.listPrice.value.toFixed(2)).toBe('1000.00');

    // Aynı entity üzerinde indirim değişse bile liste fiyatı sabit kalır.
    charge.applyDiscount({
      discountRate: new Decimal(5),
      maxDiscountPercent: new Decimal(20),
      canExceedDiscountLimit: false,
    });

    expect(charge.listPrice.value.toFixed(2)).toBe('1000.00');
    expect(charge.netAmount.value.toFixed(2)).toBe('950.00');
  });

  it('kesirli adet ve kuruşlu fiyat 2 haneye yuvarlanır', () => {
    const charge = chargeOf({
      quantity: new Decimal('1.5'),
      listPrice: Money.create('333.33', 'TRY').orThrow(),
      discountRate: new Decimal(10),
    });

    // liste toplamı 499.995 -> indirim 50.00 (yuvarlanmış), net 449.995
    expect(charge.discountAmount.value.toFixed(2)).toBe('50.00');
    expect(charge.vatAmount.value.toFixed(2)).toBe('90.00');
  });
});

describe('TreatmentCharge — indirim tavanı', () => {
  it('tavanın altındaki indirime izin verilir', () => {
    expect(() => chargeOf({ discountRate: new Decimal(15) })).not.toThrow();
  });

  it('tavana eşit indirime izin verilir (sınır dahil)', () => {
    expect(() => chargeOf({ discountRate: new Decimal(20) })).not.toThrow();
  });

  it('tavanı aşan indirimi personel veremez', () => {
    expect(() => chargeOf({ discountRate: new Decimal(30) })).toThrow(
      DiscountLimitExceededException
    );
  });

  it('reddedilen indirim frontend için istenen/izin verilen oranı taşır', () => {
    try {
      chargeOf({ discountRate: new Decimal(30) });
      fail('DiscountLimitExceededException bekleniyordu');
    } catch (error) {
      const exception = error as DiscountLimitExceededException;
      expect(exception.meta).toEqual({
        requestedRate: 30,
        maxAllowedRate: 20,
        overridableByManager: true,
      });
    }
  });

  it('yönetici tavanı aşabilir ve satıra onaylayan izi düşer', () => {
    const charge = chargeOf({
      discountRate: new Decimal(50),
      canExceedDiscountLimit: true,
      createdById: 'manager-1',
    });

    expect(charge.netAmount.value.toFixed(2)).toBe('500.00');
    expect(charge.discountApprovedById).toBe('manager-1');
  });

  it('tavan içindeki indirimde onaylayan izi bırakılmaz', () => {
    expect(chargeOf({ discountRate: new Decimal(10) }).discountApprovedById).toBe(
      null
    );
  });

  it('tavan 0 iken (varsayılan) hiç indirim verilemez', () => {
    expect(() =>
      chargeOf({
        discountRate: new Decimal(1),
        maxDiscountPercent: new Decimal(0),
      })
    ).toThrow(DiscountLimitExceededException);
  });

  it('indirim güncellemesi de tavana tabidir', () => {
    const charge = chargeOf();

    expect(() =>
      charge.applyDiscount({
        discountRate: new Decimal(40),
        maxDiscountPercent: new Decimal(20),
        canExceedDiscountLimit: false,
      })
    ).toThrow(DiscountLimitExceededException);
  });
});

describe('TreatmentCharge — iptal', () => {
  it('iptal edilen satır işaretlenir ve gerekçesi saklanır', () => {
    const charge = chargeOf();
    charge.void({ reason: 'Hasta işlemi reddetti' });

    expect(charge.isVoided).toBe(true);
    expect(charge.voidReason).toBe('Hasta işlemi reddetti');
    expect(charge.voidedAt).not.toBeNull();
  });

  it('iptal edilmiş satır tekrar iptal edilemez', () => {
    const charge = chargeOf();
    charge.void({ reason: 'yanlış giriş' });

    expect(() => charge.void({ reason: 'tekrar' })).toThrow(
      TreatmentChargeAlreadyVoidedException
    );
  });

  it('iptal edilmiş satırın indirimi değiştirilemez', () => {
    const charge = chargeOf();
    charge.void({ reason: 'yanlış giriş' });

    expect(() =>
      charge.applyDiscount({
        discountRate: new Decimal(5),
        maxDiscountPercent: new Decimal(20),
        canExceedDiscountLimit: false,
      })
    ).toThrow(TreatmentChargeAlreadyVoidedException);
  });
});
