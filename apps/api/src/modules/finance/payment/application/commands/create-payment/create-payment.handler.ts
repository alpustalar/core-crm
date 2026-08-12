import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CreatePaymentCommand,
  CreatePaymentCommandResponse,
} from './create-payment.command';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import { Money, UUID } from '@src/domain/value-objects';
import {
  IPaymentCommandRepository,
  PAYMENT_COMMAND_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment/payment.command.repository';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetAppointmentChargeSummaryQuery } from '@modules/finance/treatment-charge/application/queries/get-appointment-charge-summary/get-appointment-charge-summary.query';
import { PaymentAmountUnresolvableException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler
  implements
    ICommandHandler<CreatePaymentCommand, CreatePaymentCommandResponse>
{
  constructor(
    @Inject(PAYMENT_COMMAND_REPOSITORY)
    private readonly paymentRepo: IPaymentCommandRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: CreatePaymentCommand
  ): Promise<CreatePaymentCommandResponse> {
    const { data, internalRelations } = command;
    const paymentId = UUID.createOrGenerate(internalRelations?.paymentId);
    const installmentId = UUID.createOrGenerate(
      internalRelations?.installmentId
    );

    const totalAmount = await this.resolveAmount(data);

    const payment = Payment.create({
      id: paymentId.value,
      clinicId: data.clinicId,
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      providerId: data.providerId,
      totalAmount: totalAmount,
      installments: [
        {
          id: installmentId.value,
          installmentNo: 1,
          money: totalAmount,
          method: data.method,
          dueDate: data.dueDate,
          note: data.note,
        },
      ],
    });

    const savedPayment = await this.paymentRepo.create(payment);
    return savedPayment.id.value;
  }

  /**
   * Tahsilat tutarını çözer.
   *
   * Tutar açıkça verilmişse o esastır (kapora, kısmi ödeme, tedavi dışı gelir).
   * Verilmemişse randevunun fiyatlı işlem satırlarından türetilir — asıl yol
   * budur: personelin serbestçe tutar yazması yerine, tahsil edilen para
   * yapılan işlerin ve verilen indirimlerin toplamına eşitlenir.
   */
  private async resolveAmount(
    data: CreatePaymentCommand['data']
  ): Promise<Money> {
    if (data.amount !== undefined) {
      return Money.create(data.amount, data.currency).orThrow();
    }

    if (!data.appointmentId) {
      throw new PaymentAmountUnresolvableException();
    }

    const { data: summary } = await this.queryBus.execute(
      new GetAppointmentChargeSummaryQuery(data.appointmentId)
    );

    if (!summary) {
      throw new PaymentAmountUnresolvableException(data.appointmentId);
    }

    return Money.create(summary.grandTotal, data.currency).orThrow();
  }
}
