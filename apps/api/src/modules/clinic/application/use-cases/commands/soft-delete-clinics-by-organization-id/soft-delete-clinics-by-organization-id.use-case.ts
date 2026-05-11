import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { IGetContext } from '@common/decorators/get-context.decorator';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import {
  CLINIC_EVENT_PUBLISHER_TOKEN,
  IClinicEventPublisher,
} from '@modules/clinic/domain/interfaces/clinic.event-publisher.interface';
import { MAIL_SERVICE_TOKEN } from '@modules/mail/domain/interfaces/mail.service.interface';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';

@Injectable()
export class SoftDeleteClinicsByOrganizationIdUseCase {
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CLINIC_EVENT_PUBLISHER_TOKEN)
    private readonly clinicEventPublisher: IClinicEventPublisher,
    @Inject(MAIL_SERVICE_TOKEN)
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(organizationId: string, { actor, source }: IGetContext) {
    if (ExecutionPolicy.isUserInitiated(source)) {
      const isOwn = this.policyFactory
        .organization(actor)
        .policy.isOwnOrganization(organizationId);

      if (!isOwn) {
        throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
      } else {
        // TODO: security logu için event fırlat
      }
    }
    await this.transactionManager.run(async () => {
      const clinics =
        await this.clinicRepo.findManyByOrganizationId(organizationId);
      if (clinics.length === 0) return;

      await this.clinicRepo.softDeleteManyClinicWithAnOrganizationId(
        organizationId
      );
    });
  }
}
