import { InstallmentNotFoundException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { MarkInstallmentAsFailedHandler } from './mark-installment-as-failed.handler';
import { MarkInstallmentAsFailedCommand } from './mark-installment-as-failed.command';

describe('MarkInstallmentAsFailedHandler', () => {
  const makePayment = () => ({
    id: { value: 'pay-1' },
    appointmentId: { value: 'appt-1' },
    clinicId: { value: 'clinic-1' },
    failInstallment: jest.fn(),
  });

  const make = (payment: ReturnType<typeof makePayment> | null) => {
    const paymentQueryRepo = {
      findByInstallmentId: jest.fn().mockResolvedValue(payment),
    };
    const paymentCommandRepo = {
      save: jest.fn().mockResolvedValue(payment),
    };
    const publisher = { paymentFailed: jest.fn() };
    const txManager = {
      outboxRun: jest
        .fn()
        .mockImplementation((cb: () => Promise<unknown>) => cb()),
    };
    const handler = new MarkInstallmentAsFailedHandler(
      paymentQueryRepo as never,
      paymentCommandRepo as never,
      publisher as never,
      txManager as never
    );
    return { handler, paymentCommandRepo, publisher };
  };

  it('taksiti PENDING’e döndürür, kaydeder ve PaymentFailed event fırlatır (reason details olarak)', async () => {
    const payment = makePayment();
    const { handler, paymentCommandRepo, publisher } = make(payment);

    await handler.execute(
      new MarkInstallmentAsFailedCommand('inst-1', 'Yetersiz bakiye')
    );

    expect(payment.failInstallment).toHaveBeenCalledWith('inst-1');
    expect(paymentCommandRepo.save).toHaveBeenCalledWith(payment);
    expect(publisher.paymentFailed).toHaveBeenCalledWith({
      paymentId: 'pay-1',
      appointmentId: 'appt-1',
      clinicId: 'clinic-1',
      action: LogAction.PAYMENT_FAILED,
      type: LogType.ERROR,
      details: 'Yetersiz bakiye',
    });
  });

  it('taksit yoksa InstallmentNotFoundException atar ve event fırlatmaz', async () => {
    const { handler, publisher } = make(null);

    await expect(
      handler.execute(new MarkInstallmentAsFailedCommand('missing'))
    ).rejects.toThrow(InstallmentNotFoundException);
    expect(publisher.paymentFailed).not.toHaveBeenCalled();
  });
});
