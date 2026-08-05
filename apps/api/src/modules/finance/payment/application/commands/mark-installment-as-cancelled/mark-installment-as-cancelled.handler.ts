import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InstallmentNotFoundException } from '@modules/finance/payment/domain/exceptions/payment.exceptions';
import { MarkInstallmentAsCancelledCommand } from './mark-installment-as-cancelled.command';
import {
  IPaymentCommandRepository,
  IPaymentQueryRepository,
  PAYMENT_COMMAND_REPOSITORY,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(MarkInstallmentAsCancelledCommand)
export class MarkInstallmentAsCancelledHandler implements ICommandHandler<
  MarkInstallmentAsCancelledCommand,
  void
> {
  constructor(
    @Inject(PAYMENT_QUERY_REPOSITORY)
    private readonly paymentQueryRepo: IPaymentQueryRepository,
    @Inject(PAYMENT_COMMAND_REPOSITORY)
    private readonly paymentCommandRepo: IPaymentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: MarkInstallmentAsCancelledCommand): Promise<void> {
    const { installmentId } = command;
    const payment =
      await this.paymentQueryRepo.findByInstallmentId(installmentId);

    if (!payment) throw new InstallmentNotFoundException(installmentId);

    const validateOptions = this.policyFactory
      .entity(command.ctx.actor, command.ctx.source)
      .policy.getValidateOptions();

    payment.rules(validateOptions).canCancel().orThrow();

    payment.cancelInstallment(installmentId);
    await this.paymentCommandRepo.update(payment);
  }
}
