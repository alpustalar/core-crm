import { NotFoundException } from '@nestjs/common';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { MarkInstallmentAsRefundedHandler } from './mark-installment-as-refunded.handler';
import { MarkInstallmentAsRefundedCommand } from './mark-installment-as-refunded.command';

describe('MarkInstallmentAsRefundedHandler', () => {
  const makePayment = () => ({
    id: 'pay-1',
    appointmentId: 'appt-1',
    clinicId: 'clinic-1',
    refundInstallment: jest.fn(),
  });

  const make = (payment: ReturnType<typeof makePayment> | null) => {
    const paymentQueryRepo = {
      findByInstallmentId: jest.fn().mockResolvedValue(payment),
    };
    const paymentCommandRepo = {
      save: jest.fn().mockResolvedValue(payment),
    };
    const publisher = { paymentRefund: jest.fn() };
    const txManager = {
      outboxRun: jest
        .fn()
        .mockImplementation((cb: () => Promise<unknown>) => cb()),
    };
    const handler = new MarkInstallmentAsRefundedHandler(
      paymentQueryRepo as never,
      paymentCommandRepo as never,
      publisher as never,
      txManager as never
    );
    return { handler, paymentCommandRepo, publisher };
  };

  it('taksiti REFUNDED yapar, kaydeder ve PaymentRefund event fırlatır', async () => {
    const payment = makePayment();
    const { handler, paymentCommandRepo, publisher } = make(payment);

    await handler.execute(
      new MarkInstallmentAsRefundedCommand('inst-1', 'POS işlemi iade edildi')
    );

    expect(payment.refundInstallment).toHaveBeenCalledWith('inst-1');
    expect(paymentCommandRepo.save).toHaveBeenCalledWith(payment);
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

    await handler.execute(new MarkInstallmentAsRefundedCommand('inst-1'));

    expect(publisher.paymentRefund).toHaveBeenCalledWith(
      expect.objectContaining({ details: 'Ödeme iade edildi' })
    );
  });

  it('taksit yoksa NotFoundException atar ve event fırlatmaz', async () => {
    const { handler, publisher } = make(null);

    await expect(
      handler.execute(new MarkInstallmentAsRefundedCommand('missing'))
    ).rejects.toThrow(NotFoundException);
    expect(publisher.paymentRefund).not.toHaveBeenCalled();
  });
});
