import { Decimal } from 'decimal.js';
import { PaymentPaidInvoiceListener } from './payment-paid.listener';

describe('PaymentPaidInvoiceListener', () => {
  const make = (payment: unknown) => {
    const commandBus = { execute: jest.fn().mockResolvedValue(undefined) };
    const queryBus = { execute: jest.fn().mockResolvedValue({ data: payment }) };
    const listener = new PaymentPaidInvoiceListener(
      commandBus as never,
      queryBus as never
    );
    return { listener, commandBus, queryBus };
  };

  const event = {
    installmentId: 'inst-1',
    paymentId: 'pay-1',
    appointmentId: 'apt-1',
    clinicId: 'clinic-1',
  } as never;

  it('tahsil edilen taksit tutarı + cari ile fatura komutu üretir', async () => {
    const payment = {
      patientId: 'patient-1',
      currency: 'TRY',
      totalAmount: new Decimal(300),
      installments: [
        { id: 'inst-1', amount: new Decimal(100), currency: 'TRY' },
      ],
    };
    const { listener, commandBus } = make(payment);

    await listener.handle(event);

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const input = commandBus.execute.mock.calls[0][0].input;
    expect(input).toMatchObject({
      clinicId: 'clinic-1',
      patientId: 'patient-1',
      paymentId: 'pay-1',
      trigger: 'PAYMENT',
    });
    // Tutar artık Money VO olarak taşınır.
    expect(input.totalAmount.amount.toNumber()).toBe(100);
    expect(input.totalAmount.currency).toBe('TRY');
  });

  it('ödeme bulunamazsa fatura komutu üretmez', async () => {
    const { listener, commandBus } = make(null);
    await listener.handle(event);
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('taksit eşleşmezse ödeme toplamını faturalar', async () => {
    const payment = {
      patientId: 'patient-2',
      currency: 'TRY',
      totalAmount: new Decimal(300),
      installments: [
        { id: 'other', amount: new Decimal(100), currency: 'TRY' },
      ],
    };
    const { listener, commandBus } = make(payment);

    await listener.handle(event);

    expect(
      commandBus.execute.mock.calls[0][0].input.totalAmount.amount.toNumber()
    ).toBe(300);
  });
});
