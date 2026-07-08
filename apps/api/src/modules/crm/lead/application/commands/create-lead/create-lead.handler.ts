import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLeadCommand } from './create-lead.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';

@CommandHandler(CreateLeadCommand)
export class CreateLeadHandler
  implements ICommandHandler<CreateLeadCommand, string>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateLeadCommand): Promise<string> {
    const { dto, clinicId, ctx } = command;
    const { actor } = ctx;

    const lead = Lead.create({
      clinicId,
      source: dto.source,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      notes: dto.notes,
      assignedToId: dto.assignedToId,
      medium: dto.medium,
      metaLeadId: dto.metaLeadId,
      campaignId: dto.campaignId,
      campaignName: dto.campaignName,
      adId: dto.adId,
      adsetId: dto.adsetId,
      ctwaClid: dto.ctwaClid,
      sourceUrl: dto.sourceUrl,
      actorId: actor.userId,
      logSource: actor.source,
    });

    return this.txManager.run(async () => {
      const savedLead = await this.leadCommandRepo.create(lead);
      return savedLead.id.value;
    });
  }
}
