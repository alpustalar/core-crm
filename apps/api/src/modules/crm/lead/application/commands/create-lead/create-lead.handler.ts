import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLeadCommand } from './create-lead.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead/lead.command.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetDefaultPipelineQuery } from '@modules/crm/pipeline/application/queries/get-default-pipeline/get-default-pipeline.query';
import { IGetContext } from '@common/decorators';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';

@CommandHandler(CreateLeadCommand)
export class CreateLeadHandler
  implements ICommandHandler<CreateLeadCommand, string>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadRepo: ILeadCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateLeadCommand): Promise<string> {
    const { data, clinicId, ctx } = command.payload;

    const organizationId = await this.tenantScopeResolver.resolve({
      clinicId,
    });

    // Kliniğin varsayılan hunisinin ilk aşamasına yerleştir (best-effort; huni yoksa atla).
    const seed = await this.resolveDefaultStage(clinicId, ctx);

    const lead = Lead.create({
      clinicId,
      organizationId,
      source: data.source,
      name: data.name,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      assignedToId: data.assignedToId,
      pipelineId: seed?.pipelineId,
      stageId: seed?.stageId,
      medium: data.medium,
      metaLeadId: data.metaLeadId,
      campaignId: data.campaignId,
      campaignName: data.campaignName,
      adId: data.adId,
      adsetId: data.adsetId,
      ctwaClid: data.ctwaClid,
      sourceUrl: data.sourceUrl,
      actorId: ctx.actor.userId,
      logSource: ctx.actor.source,
    });

    return this.txManager.run(async () => {
      const savedLead = await this.leadRepo.create(lead);
      return savedLead.id.value;
    });
  }

  private async resolveDefaultStage(
    clinicId: string,
    ctx: IGetContext
  ): Promise<{ pipelineId: string; stageId: string } | null> {
    const { data: pipeline } = await this.queryBus.execute(
      new GetDefaultPipelineQuery(clinicId, ctx)
    );
    const firstStage = pipeline?.stages[0];
    if (!pipeline || !firstStage) return null;

    return { pipelineId: pipeline.id, stageId: firstStage.id };
  }
}
