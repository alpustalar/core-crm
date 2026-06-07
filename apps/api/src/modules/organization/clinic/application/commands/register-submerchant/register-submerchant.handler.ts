import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { RegisterClinicSubMerchantCommand } from './register-submerchant.command';
import {
  CLINIC_COMMAND_REPOSITORY,
  CLINIC_QUERY_REPOSITORY,
  IClinicCommandRepository,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(RegisterClinicSubMerchantCommand)
export class RegisterClinicSubMerchantHandler
  implements ICommandHandler<RegisterClinicSubMerchantCommand, void>
{
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicQueryRepo: IClinicQueryRepository,
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RegisterClinicSubMerchantCommand): Promise<void> {
    const { clinicId, dto, ctx } = command;
    const { actor } = ctx;

    const { policy } = this.policyFactory.clinic(actor);
    if (
      !policy.isSystemAdmin() &&
      !policy.actorCanManageTargetClinic(clinicId)
    ) {
      throw new ForbiddenException(
        'Bu kliniğin ödeme altyapısını yönetme yetkiniz yok.'
      );
    }

    const clinic = await this.clinicQueryRepo.findById(clinicId);
    if (!clinic) throw new NotFoundException('Klinik bulunamadı.');

    const conversationId = crypto.randomUUID();

    let subMerchantKey: string;
    if (clinic.iyzicoSubMerchantKey) {
      await this.iyzicoProvider.updateSubMerchant({
        conversationId,
        subMerchantKey: clinic.iyzicoSubMerchantKey,
        subMerchantExternalId: clinicId,
        ...dto,
      });
      subMerchantKey = clinic.iyzicoSubMerchantKey;
    } else {
      const result = await this.iyzicoProvider.createSubMerchant({
        conversationId,
        subMerchantExternalId: clinicId,
        ...dto,
      });
      subMerchantKey = result.subMerchantKey;
    }

    await this.txManager.run(async () => {
      clinic.registerSubMerchant(subMerchantKey);
      await this.clinicCommandRepo.save(clinic);
    });
  }
}
