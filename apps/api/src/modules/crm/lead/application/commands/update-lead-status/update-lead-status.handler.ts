import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLeadStatusCommand } from './update-lead-status.command';
import {
  ILeadCommandRepository,
  ILeadQueryRepository,
  LEAD_COMMAND_REPOSITORY,
  LEAD_QUERY_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import {
  ILeadEventPublisher,
  LEAD_EVENT_PUBLISHER,
} from '@modules/crm/lead/domain/interfaces/lead-event-publisher.interface';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(UpdateLeadStatusCommand)
export class UpdateLeadStatusHandler
  implements ICommandHandler<UpdateLeadStatusCommand, void>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: ILeadQueryRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateLeadStatusCommand): Promise<void> {
    const { leadId, dto, ctx } = command;
    const { actor } = ctx;

    await this.txManager.run(async () => {
      const lead = await this.leadQueryRepo.findById(leadId);
      if (!lead) throw new NotFoundException('Lead bulunamadı.');

      const previousStatus = lead.status;

      if (dto.status === 'CONTACTED') {
        lead.contact();
      } else if (dto.status === 'QUALIFIED') {
        lead.qualify();
      }

      if (dto.notes) lead.updateNotes(dto.notes);

      const saved = await this.leadCommandRepo.save(lead);

      this.eventPublisher.leadStatusChanged({
        leadId: lead.id,
        clinicId: lead.clinicId,
        previousStatus,
        newStatus: saved.status,
        actorId: actor.userId,
        source: LogSource.WEB,
        action: LogAction.LEAD_STATUS_CHANGED,
        type: LogType.INFO,
        details: `Lead durumu güncellendi: ${previousStatus} → ${saved.status}`,
      });
    });
  }
}
