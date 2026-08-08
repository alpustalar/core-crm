import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterClinicPaymentGatewayCommand } from './register-clinic-payment-gateway.command';
import { ClinicPaymentGateway } from '@modules/finance/payment-gateway/domain/entities/clinic-payment-gateway.entity';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/interfaces/iyzico.provider.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import {
  CLINIC_PAYMENT_GATEWAY_COMMAND_REPOSITORY,
  IClinicPaymentGatewayCommandRepository,
} from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway/clinic-payment-gateway.command.repository';

@CommandHandler(RegisterClinicPaymentGatewayCommand)
export class RegisterClinicPaymentGatewayHandler
  implements ICommandHandler<RegisterClinicPaymentGatewayCommand, void>
{
  constructor(
    @Inject(CLINIC_PAYMENT_GATEWAY_COMMAND_REPOSITORY)
    private readonly clinicPaymentGatewayRepo: IClinicPaymentGatewayCommandRepository,
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RegisterClinicPaymentGatewayCommand): Promise<void> {
    const { clinicId, dto, ctx } = command;

    const { evaluator } = this.policyFactory.clinic(ctx.actor, ctx.source);
    evaluator
      .check(
        (p) => p.actorCanManageTargetClinic(clinicId),
        'Bu kliniğin ödeme altyapısını yönetme yetkiniz yok.'
      )
      .orThrow(CLINIC_EVENTS.REGISTER_SUBMERCHANT);

    const existing =
      await this.clinicPaymentGatewayRepo.findByClinicId(clinicId);
    const conversationId = crypto.randomUUID();

    let subMerchantKey: string;
    if (existing) {
      await this.iyzicoProvider.updateSubMerchant({
        conversationId,
        subMerchantKey: existing.iyzicoSubMerchantKey,
        subMerchantExternalId: clinicId,
        ...dto,
      });
      subMerchantKey = existing.iyzicoSubMerchantKey;
    } else {
      const result = await this.iyzicoProvider.createSubMerchant({
        conversationId,
        subMerchantExternalId: clinicId,
        ...dto,
      });
      subMerchantKey = result.subMerchantKey;
    }

    await this.txManager.run(async () => {
      const entity =
        existing ??
        ClinicPaymentGateway.create({
          clinicId,
          iyzicoSubMerchantKey: subMerchantKey,
        });
      if (existing) entity.updateSubMerchantKey(subMerchantKey);
      await this.clinicPaymentGatewayRepo.upsertByClinicId(entity);
    });
  }
}
