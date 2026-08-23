import { randomUUID } from 'crypto';
import { Payment } from './payment.entity';
import { PaymentRefundedEvent } from '@modules/finance/payment/domain/events/payment-refunded.event';
import { Money } from '@src/domain/value-objects/money.vo';
import { LogSource } from '@src/domain/constants/log-action.constant';

describe('Payment entity — iade event\'i', () => {
  const installmentId = randomUUID();
  /** Hasta kimliği Firebase UID (28 alfanümerik) — UUID değil. */
  const patientId = 'aB3xY9zQ7wE1rT5yU8iO2pL4kJ6h';

  const build = () =>
    Payment.create({
      clinicId: randomUUID(),
      patientId,
      totalAmount: Money.create(1000, 'TRY').orThrow(),
      installments: [
        {
          id: installmentId,
          installmentNo: 1,
          money: Money.create(1000, 'TRY').orThrow(),
        },
      ],
    });

  it('refundInstallment → PaymentRefundedEvent entity içinde raise edilir', () => {
    const payment = build();

    payment.refundInstallment({
      installmentId,
      actorId: 'user-7',
      logSource: LogSource.WEB,
      details: 'POS işlemi iade edildi',
    });

    const events = payment.getDomainEvents();
    expect(events).toHaveLength(1);

    const event = events[0] as PaymentRefundedEvent;
    expect(event).toBeInstanceOf(PaymentRefundedEvent);
    expect(event.installmentId).toBe(installmentId);
    expect(event.paymentId).toBe(payment.id.value);
    // actorId super'e geçmiyordu; iade denetim kaydı aktörsüz yazılıyordu.
    expect(event.log?.actorId).toBe('user-7');
    expect(event.log?.source).toBe(LogSource.WEB);
    expect(event.log?.details).toBe('POS işlemi iade edildi');
  });

  it('details verilmezse varsayılan denetim metni yazılır', () => {
    const payment = build();

    payment.refundInstallment({
      installmentId,
      actorId: 'user-7',
      logSource: LogSource.SYSTEM,
    });

    const event = payment.getDomainEvents()[0] as PaymentRefundedEvent;
    expect(event.log?.details).toBe('Ödeme iade edildi');
  });

  it('iade tek bir event üretir (muhasebe ters kaydı iki kez koşmasın)', () => {
    // Regresyon: iyzico iade handler'ı MarkInstallmentAsRefundedCommand'ı
    // çağırdıktan SONRA bir de kendisi publish ediyordu → RefundLedgerEntries
    // iki kez tetikleniyordu. Event'in tek kaynağı artık entity.
    const payment = build();

    payment.refundInstallment({
      installmentId,
      actorId: 'user-7',
      logSource: LogSource.WEB,
    });

    expect(
      payment
        .getDomainEvents()
        .filter((e) => e instanceof PaymentRefundedEvent)
    ).toHaveLength(1);
  });
});

describe('Payment entity — kısmi iadede ödeme durumu', () => {
  const patientId = 'aB3xY9zQ7wE1rT5yU8iO2pL4kJ6h';

  const buildThreeInstallments = () => {
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    const payment = Payment.create({
      clinicId: randomUUID(),
      patientId,
      totalAmount: Money.create(3000, 'TRY').orThrow(),
      installments: ids.map((id, index) => ({
        id,
        installmentNo: index + 1,
        money: Money.create(1000, 'TRY').orThrow(),
      })),
    });
    return { payment, ids };
  };

  const audit = { actorId: 'user-1', logSource: LogSource.WEB };

  it('3 taksitten biri iade edilirse ödeme REFUNDED OLMAZ', () => {
    // Regresyon: `refundInstallment` ödemeyi koşulsuz REFUNDED yapıyordu. Cari
    // özet sorguları yalnız COMPLETED satırları topladığı için hasta, iade
    // edilmeyen iki taksiti de ödememiş gibi görünüyordu.
    const { payment, ids } = buildThreeInstallments();

    payment.refundInstallment({ installmentId: ids[1], ...audit });

    expect(payment.status).toBe('PARTIAL');
    const refunded = payment.installments.filter((i) => i.status === 'REFUNDED');
    expect(refunded).toHaveLength(1);
    expect(refunded[0].id).toBe(ids[1]);
  });

  it('tüm taksitler iade edilince ödeme REFUNDED olur', () => {
    const { payment, ids } = buildThreeInstallments();

    ids.forEach((installmentId) =>
      payment.refundInstallment({ installmentId, ...audit })
    );

    expect(payment.status).toBe('REFUNDED');
  });

  it('tek taksitli ödemede iade doğrudan REFUNDED yapar', () => {
    const singleId = randomUUID();
    const payment = Payment.create({
      clinicId: randomUUID(),
      patientId,
      totalAmount: Money.create(500, 'TRY').orThrow(),
      installments: [
        {
          id: singleId,
          installmentNo: 1,
          money: Money.create(500, 'TRY').orThrow(),
        },
      ],
    });

    payment.refundInstallment({ installmentId: singleId, ...audit });

    expect(payment.status).toBe('REFUNDED');
  });

  it('iptal edilmiş taksitler "hepsi iade edildi" kararını engellemez', () => {
    const { payment, ids } = buildThreeInstallments();

    payment.cancelInstallment(ids[2]);
    payment.refundInstallment({ installmentId: ids[0], ...audit });
    payment.refundInstallment({ installmentId: ids[1], ...audit });

    expect(payment.status).toBe('REFUNDED');
  });
});
