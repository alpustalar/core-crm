import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateActivityCommand } from './create-activity.command';
import {
  ACTIVITY_COMMAND_REPOSITORY,
  IActivityCommandRepository,
} from '@modules/crm/activity/domain/repositories/activity.repository';
import { Activity } from '@modules/crm/activity/domain/entities/activity.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindOrganizationIdByClinicIdQuery } from '@modules/organization/organization/application/queries/find-organization-id-by-clinic-id/find-organization-id-by-clinic-id.query';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ACTIVITY_EVENTS } from '@src/domain/constants/events';

@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler
  implements ICommandHandler<CreateActivityCommand, string>
{
  constructor(
    @Inject(ACTIVITY_COMMAND_REPOSITORY)
    private readonly activityCommandRepo: IActivityCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateActivityCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    const result = actor.organizationId
      ? actor
      : await this.queryBus.execute(
          new FindOrganizationIdByClinicIdQuery(data.clinicId)
        );

    const organizationId = result.organizationId;

    if (!organizationId) throw new Error('Organizasyon bulunamadı');

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
      const saved = await this.activityCommandRepo.create(activity);
      return saved.id.value;
    });
  }
}
