import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkLeadLostCommand } from './mark-lead-lost.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import {
  ENTITY_POLICY,
  IEntityPolicy,
} from '@modules/platform/policy/entity/domain/interfaces/entity-policy.interface';

@CommandHandler(MarkLeadLostCommand)
export class MarkLeadLostHandler
  implements ICommandHandler<MarkLeadLostCommand, void>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(ENTITY_POLICY)
    private readonly entityPolicy: IEntityPolicy,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkLeadLostCommand): Promise<void> {
    const { leadId, dto, ctx } = command;
    const { actor, source } = ctx;

    await this.txManager.run(async () => {
      const lead = await this.leadCommandRepo.findById(leadId);
      if (!lead) throw new LeadNotFoundException();

      const validateOptions = this.entityPolicy.getValidateOptions(
        actor,
        source
      );

      lead.markLost({
        reason: dto.lostReason,
        actor,
        validateOptions,
      });
      await this.leadCommandRepo.save(lead);
    });
  }
}
