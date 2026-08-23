import { InstallmentNotFoundException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { MarkInstallmentAsRefundedHandler } from './mark-installment-as-refunded.handler';
import { MarkInstallmentAsRefundedCommand } from './mark-installment-as-refunded.command';

describe('MarkInstallmentAsRefundedHandler', () => {
  const ctx = {
    actor: { userId: 'u1', source: LogSource.WEB },
    source: 'API',
  } as never;

  const makePayment = () => ({
    id: { value: 'pay-1' },
    appointmentId: { value: 'appt-1' },
    clinicId: { value: 'clinic-1' },
    rules: () => ({ canRefund: () => ({ orThrow: () => undefined }) }),
    refundInstallment: jest.fn(),
  });

  const make = (payment: ReturnType<typeof makePayment> | null) => {
    // Okuma da yazma da command repo'dan: kilitli okuma + güncelleme aynı tx'te.
    const paymentCommandRepo = {
      findByInstallmentIdForUpdate: jest.fn().mockResolvedValue(payment),
      update: jest.fn().mockResolvedValue(payment),
    };
    const policyFactory = {
      entity: jest.fn().mockReturnValue({
        policy: { getValidateOptions: jest.fn().mockReturnValue({}) },
      }),
    };
    const txManager = {
      outboxRun: jest
        .fn()
        .mockImplementation((cb: () => Promise<unknown>) => cb()),
    };
    const handler = new MarkInstallmentAsRefundedHandler(
      paymentCommandRepo as never,
      policyFactory as never,
      txManager as never
    );
    return { handler, paymentCommandRepo };
  };

  const run = (
    handler: MarkInstallmentAsRefundedHandler,
    installmentId: string,
    details?: string
  ) =>
    handler.execute(
      new MarkInstallmentAsRefundedCommand({ installmentId, details, ctx })
    );

  it('taksiti entity üzerinden iade eder ve aktörü audit alanlarına taşır', async () => {
    // Event'i handler değil entity raise ediyor; handler'ın işi doğru aktörü
    // geçirip kaydetmek. Publisher çağrısı bilerek YOK (bkz. mükerrer ters kayıt).
    const payment = makePayment();
    const { handler, paymentCommandRepo } = make(payment);

    await run(handler, 'inst-1', 'POS işlemi iade edildi');

    expect(payment.refundInstallment).toHaveBeenCalledWith({
      installmentId: 'inst-1',
      details: 'POS işlemi iade edildi',
      actorId: 'u1',
      logSource: LogSource.WEB,
    });
    expect(paymentCommandRepo.update).toHaveBeenCalledWith(payment);
  });

  it('details verilmezse entity varsayılan metni yazsın diye undefined geçilir', async () => {
    const payment = makePayment();
    const { handler } = make(payment);

    await run(handler, 'inst-1');

    expect(payment.refundInstallment).toHaveBeenCalledWith(
      expect.objectContaining({ details: undefined })
    );
  });

  it('taksit yoksa InstallmentNotFoundException atar ve kayıt güncellenmez', async () => {
    const { handler, paymentCommandRepo } = make(null);

    await expect(run(handler, 'missing')).rejects.toThrow(
      InstallmentNotFoundException
    );
    expect(paymentCommandRepo.update).not.toHaveBeenCalled();
  });
});
