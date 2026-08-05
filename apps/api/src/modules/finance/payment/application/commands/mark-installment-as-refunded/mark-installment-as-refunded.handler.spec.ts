import { InstallmentNotFoundException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { MarkInstallmentAsRefundedHandler } from './mark-installment-as-refunded.handler';
import { MarkInstallmentAsRefundedCommand } from './mark-installment-as-refunded.command';

describe('MarkInstallmentAsRefundedHandler', () => {
  const ctx = { actor: { id: 'u1' }, source: 'API' } as never;

  const makePayment = () => ({
    id: { value: 'pay-1' },
    appointmentId: { value: 'appt-1' },
    clinicId: { value: 'clinic-1' },
    rules: () => ({ canRefund: () => ({ orThrow: () => undefined }) }),
    refundInstallment: jest.fn(),
  });

  const make = (payment: ReturnType<typeof makePayment> | null) => {
    const paymentQueryRepo = {
      findByInstallmentId: jest.fn().mockResolvedValue(payment),
    };
    const paymentCommandRepo = {
      update: jest.fn().mockResolvedValue(payment),
    };
    const publisher = { paymentRefund: jest.fn() };
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
      paymentQueryRepo as never,
      paymentCommandRepo as never,
      publisher as never,
      policyFactory as never,
      txManager as never
    );
    return { handler, paymentCommandRepo, publisher };
  };

  const run = (
    handler: MarkInstallmentAsRefundedHandler,
    installmentId: string,
    details?: string
  ) =>
    handler.execute(
      new MarkInstallmentAsRefundedCommand({ installmentId, details, ctx })
    );

  it('taksiti REFUNDED yapar, kaydeder ve PaymentRefund event fırlatır', async () => {
    const payment = makePayment();
    const { handler, paymentCommandRepo, publisher } = make(payment);

    await run(handler, 'inst-1', 'POS işlemi iade edildi');

    expect(payment.refundInstallment).toHaveBeenCalledWith('inst-1');
    expect(paymentCommandRepo.update).toHaveBeenCalledWith(payment);
    expect(publisher.paymentRefund).toHaveBeenCalledWith({
      installmentId: 'inst-1',
      paymentId: 'pay-1',
      appointmentId: 'appt-1',
      clinicId: 'clinic-1',
      action: LogAction.PAYMENT_REFUNDED,
      type: LogType.INFO,
      details: 'POS işlemi iade edildi',
    });
  });

  it('details verilmezse varsayılan detayla event fırlatır', async () => {
    const { handler, publisher } = make(makePayment());

    await run(handler, 'inst-1');

    expect(publisher.paymentRefund).toHaveBeenCalledWith(
      expect.objectContaining({ details: 'Ödeme iade edildi' })
    );
  });

  it('taksit yoksa InstallmentNotFoundException atar ve event fırlatmaz', async () => {
    const { handler, publisher } = make(null);

    await expect(run(handler, 'missing')).rejects.toThrow(
      InstallmentNotFoundException
    );
    expect(publisher.paymentRefund).not.toHaveBeenCalled();
  });
});
