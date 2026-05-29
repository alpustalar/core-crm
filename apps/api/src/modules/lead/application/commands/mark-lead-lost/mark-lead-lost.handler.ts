import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkLeadLostCommand } from './mark-lead-lost.command';
import {
  LEAD_COMMAND_REPOSITORY,
  LEAD_QUERY_REPOSITORY,
  ILeadCommandRepository,
  ILeadQueryRepository,
} from '@modules/lead/domain/repositories/lead.repository.interface';
import {
  LEAD_EVENT_PUBLISHER,
  ILeadEventPublisher,
} from '@modules/lead/domain/interfaces/lead-event-publisher.interface';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(MarkLeadLostCommand)
export class MarkLeadLostHandler implements ICommandHandler<MarkLeadLostCommand, void> {
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: ILeadQueryRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: MarkLeadLostCommand): Promise<void> {
    const { leadId, dto, ctx } = command;
    const { actor } = ctx;

    await this.txManager.run(async () => {
      const lead = await this.leadQueryRepo.findById(leadId);
      if (!lead) throw new NotFoundException('Lead bulunamadı.');

      lead.markLost(dto.lostReason);
      const saved = await this.leadCommandRepo.save(lead);

      this.eventPublisher.leadLost({
        leadId: lead.id,
        clinicId: lead.clinicId,
        lostReason: saved.lostReason,
        actorId: actor.userId,
        source: LogSource.WEB,
        action: LogAction.LEAD_LOST,
        type: LogType.INFO,
        details: `Lead kaybedildi${dto.lostReason ? `: ${dto.lostReason}` : ''}`,
      });
    });
  }
}
