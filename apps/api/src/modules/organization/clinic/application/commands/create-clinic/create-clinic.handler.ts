import { CreateClinicProps } from '@modules/organization/clinic/domain/contracts/clinic';
import { Clinic } from '@modules/organization/clinic/domain/entities/clinic.entity';

import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TimeZoneSchema } from '@shared';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { AttachClinicToOrganizationOwnersCommand } from '@modules/identity/user/application/commands/attach-clinic-to-organization-owners/attach-clinic-to-organization-owners.command';
import { CLINIC_EVENTS } from '@src/domain/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { CreateClinicCommand } from './create-clinic.command';
import {
  CLINIC_COMMAND_REPOSITORY,
  IClinicCommandRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.command.repository';

@CommandHandler(CreateClinicCommand)
export class CreateClinicHandler implements ICommandHandler<
  CreateClinicCommand,
  string
> {
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateClinicCommand) {
    const { data, ctx, internalRelations } = command.payload;
    const { actor, source } = ctx;

    const organizationId =
      internalRelations?.organizationId ?? data.organizationId;
    const props: CreateClinicProps = {
      ...data,
      organizationId,
      id: internalRelations?.clinicId,
      timezone: TimeZoneSchema.enum.Europe_Istanbul,
    };

    const { evaluator } = this.policyFactory.organization(actor, source);
    if (organizationId) {
      evaluator
        .check(
          (p) => p.actorCanManageTargetOrganization(organizationId),
          'Yetki ihlali'
        )
        .orThrow(CLINIC_EVENTS.CREATED);
    }

    const actorId = ExecutionPolicy.isUserInitiated(source)
      ? actor.userId
      : undefined;

    const clinic = Clinic.create(props, actorId);

    return this.txManager.run(async () => {
      const saved = await this.clinicCommandRepo.create(clinic);

      // Sahiplik organizasyon seviyesinde durur, `managedClinics` ise açık bir
      // atamadır: yeni klinik oraya girmezse sahip kendi açtığı klinikte
      // klinik-seviye kontrollerin ve "yönettiğim klinikler" listelerinin dışında
      // kalır. Aynı transaction içinde: klinik yaratılıp bağ kurulmadan kalırsa
      // boşluk sessizce geri döner.
      await this.commandBus.execute(
        new AttachClinicToOrganizationOwnersCommand(
          clinic.organizationId.value,
          saved.id.value
        )
      );

      return saved.id.value;
    });
  }
}
