import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Pipeline } from '@modules/crm/pipeline/domain/entities/pipeline.entity';
import { PipelineStage } from '@modules/crm/pipeline/domain/entities/pipeline-stage.entity';
import {
  DEFAULT_PIPELINE_NAME,
  DEFAULT_PIPELINE_STAGES,
} from '@modules/crm/pipeline/domain/contracts/pipeline.contracts';
import { CreatePipelineCommand } from './create-pipeline.command';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { PIPELINE_EVENTS } from '@src/domain/constants/events/pipeline.constant';
import {
  IPipelineCommandRepository,
  PIPELINE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.command.repository';
import {
  IPipelineStageCommandRepository,
  PIPELINE_STAGE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline-stage/pipeline-stage.command.repository';

@CommandHandler(CreatePipelineCommand)
export class CreatePipelineHandler
  implements ICommandHandler<CreatePipelineCommand, string>
{
  constructor(
    @Inject(PIPELINE_COMMAND_REPOSITORY)
    private readonly pipelineRepo: IPipelineCommandRepository,
    @Inject(PIPELINE_STAGE_COMMAND_REPOSITORY)
    private readonly pipelineStageRepo: IPipelineStageCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreatePipelineCommand): Promise<string> {
    const { data, ctx } = command;

    const organizationId = await this.tenantScopeResolver.resolve(data);

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(data.clinicId))
      .orThrow(PIPELINE_EVENTS.CREATED);

    const pipeline = Pipeline.create({
      organizationId,
      clinicId: data.clinicId,
      name: data.name ?? DEFAULT_PIPELINE_NAME,
      isDefault: data.isDefault ?? false,
    });

    // Varsayılan aşama şablonunu bu huniye seed'le.
    const stages = DEFAULT_PIPELINE_STAGES.map((stageTemplate) =>
      PipelineStage.create({
        pipelineId: pipeline.id.value,
        name: stageTemplate.name,
        order: stageTemplate.order,
        type: stageTemplate.type,
        color: stageTemplate.color,
      })
    );

    return this.txManager.run(async () => {
      await this.pipelineRepo.create(pipeline);
      await this.pipelineStageRepo.createMany(stages);
      return pipeline.id.value;
    });
  }
}
