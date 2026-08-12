import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateActivityCommand } from './create-activity.command';
import { Activity } from '@modules/crm/activity/domain/entities/activity.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ACTIVITY_EVENTS } from '@src/domain/constants/events';
import {
  ACTIVITY_COMMAND_REPOSITORY,
  IActivityCommandRepository,
} from '@modules/crm/activity/domain/repositories/activity/activity.command.repository';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler
  implements ICommandHandler<CreateActivityCommand, string>
{
  constructor(
    @Inject(ACTIVITY_COMMAND_REPOSITORY)
    private readonly activityRepo: IActivityCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateActivityCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    const organizationId = await this.tenantScopeResolver.resolve(data);

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessClinicAndOrganization(data.clinicId, organizationId)
      )
      .orThrow(ACTIVITY_EVENTS.CREATED);

    const activity = Activity.create({
      clinicId: data.clinicId,
      organizationId,
      leadId: data.leadId,
      patientId: data.patientId,
      type: data.type,
      subject: data.subject,
      notes: data.notes,
      assignedToId: data.assignedToId,
      createdById: actor.userId,
      dueAt: data.dueAt,
    });

    return this.txManager.run(async () => {
      const saved = await this.activityRepo.create(activity);
      return saved.id.value;
    });
  }
}
