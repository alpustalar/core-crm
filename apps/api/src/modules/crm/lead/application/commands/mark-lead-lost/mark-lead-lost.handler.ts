import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkLeadLostCommand } from './mark-lead-lost.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead/lead.command.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetPipelineByIdQuery } from '@modules/crm/pipeline/application/queries/get-pipeline-by-id/get-pipeline-by-id.query';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { IGetContext } from '@common/decorators/get-context.decorator';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(MarkLeadLostCommand)
export class MarkLeadLostHandler
  implements ICommandHandler<MarkLeadLostCommand, void>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadRepo: ILeadCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkLeadLostCommand): Promise<void> {
    const { leadId, data, ctx } = command.payload;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(data.clinicId))
      .orThrow();

    await this.txManager.run(async () => {
      const lead = await this.leadRepo.findById(leadId);
      if (!lead) throw new LeadNotFoundException();

      const validateOptions = this.policyFactory
        .entity(ctx.actor, ctx.source)
        .policy.getValidateOptions();

      lead.rules(validateOptions).markLost().orThrow();

      lead.markLost(ctx.actor, data.lostReason);

      // Kanban tutarlılığı: lead bir huniye bağlıysa LOST aşamasına taşı.
      await this.syncLostStage(lead, ctx);

      await this.leadRepo.update(lead);
    });
  }

  /** Lead'in hunisindeki LOST tipli aşamayı bulup stageId'yi senkronlar (varsa). */
  private async syncLostStage(lead: Lead, ctx: IGetContext): Promise<void> {
    if (!lead.pipelineId) return;

    const { data: pipeline } = await this.queryBus.execute(
      new GetPipelineByIdQuery(lead.pipelineId, ctx)
    );
    const lostStage = pipeline?.stages.find((s) => s.type === 'LOST');
    if (pipeline && lostStage) {
      lead.assignStage({ pipelineId: pipeline.id, stageId: lostStage.id });
    }
  }
}
