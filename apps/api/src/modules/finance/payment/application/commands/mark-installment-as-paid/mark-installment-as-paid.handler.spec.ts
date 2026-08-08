import { InstallmentNotFoundException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { MarkInstallmentAsPaidHandler } from './mark-installment-as-paid.handler';
import { MarkInstallmentAsPaidCommand } from './mark-installment-as-paid.command';

describe('MarkInstallmentAsPaidHandler', () => {
  const makePayment = () => ({
    id: { value: 'pay-1' },
    appointmentId: { value: 'appt-1' },
    clinicId: { value: 'clinic-1' },
    completeInstallment: jest.fn(),
  });

  const make = (payment: ReturnType<typeof makePayment> | null) => {
    // Okuma da yazma da command repo'dan: kilitli okuma + güncelleme aynı tx'te.
    const paymentCommandRepo = {
      findByInstallmentIdForUpdate: jest.fn().mockResolvedValue(payment),
      update: jest.fn().mockResolvedValue(payment),
    };
    const publisher = { paymentPaid: jest.fn() };
    const txManager = {
      outboxRun: jest
        .fn()
        .mockImplementation((cb: () => Promise<unknown>) => cb()),
    };
    const handler = new MarkInstallmentAsPaidHandler(
      paymentCommandRepo as never,
      publisher as never,
      txManager as never
    );
    return { handler, paymentCommandRepo, publisher };
  };

  it('taksiti COMPLETED yapar, kaydeder ve PaymentPaid event fırlatır (aggregate’ten türetilmiş alanlarla)', async () => {
    const payment = makePayment();
    const { handler, paymentCommandRepo, publisher } = make(payment);

    await handler.execute(
      new MarkInstallmentAsPaidCommand('inst-1', 'POS ödemesi tahsil edildi')
    );

    expect(payment.completeInstallment).toHaveBeenCalledWith('inst-1');
    expect(paymentCommandRepo.update).toHaveBeenCalledWith(payment);
    expect(publisher.paymentPaid).toHaveBeenCalledWith({
      installmentId: 'inst-1',
      paymentId: 'pay-1',
      appointmentId: 'appt-1',
      clinicId: 'clinic-1',
      action: LogAction.PAYMENT_SUCCESS,
      type: LogType.INFO,
      details: 'POS ödemesi tahsil edildi',
    });
  });

  it('details verilmezse varsayılan detayla event fırlatır', async () => {
    const { handler, publisher } = make(makePayment());

    await handler.execute(new MarkInstallmentAsPaidCommand('inst-1'));

    expect(publisher.paymentPaid).toHaveBeenCalledWith(
      expect.objectContaining({ details: 'Ödeme tahsil edildi' })
    );
  });

  it('taksit yoksa InstallmentNotFoundException atar ve event fırlatmaz', async () => {
    const { handler, publisher } = make(null);

    await expect(
      handler.execute(new MarkInstallmentAsPaidCommand('missing'))
    ).rejects.toThrow(InstallmentNotFoundException);
    expect(publisher.paymentPaid).not.toHaveBeenCalled();
  });
});
