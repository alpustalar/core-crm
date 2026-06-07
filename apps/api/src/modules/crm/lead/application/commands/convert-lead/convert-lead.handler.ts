import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConvertLeadCommand } from './convert-lead.command';
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

@CommandHandler(ConvertLeadCommand)
export class ConvertLeadHandler
  implements ICommandHandler<ConvertLeadCommand, void>
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

  async execute(command: ConvertLeadCommand): Promise<void> {
    const { leadId, dto, ctx } = command;
    const { actor } = ctx;

    await this.txManager.run(async () => {
      const lead = await this.leadQueryRepo.findById(leadId);
      if (!lead) throw new NotFoundException('Lead bulunamadı.');

      lead.convert(dto.patientId ?? null, dto.appointmentId ?? null);
      const saved = await this.leadCommandRepo.save(lead);

      this.eventPublisher.leadConverted({
        leadId: lead.id,
        clinicId: lead.clinicId,
        patientId: saved.patientId,
        appointmentId: saved.appointmentId,
        actorId: actor.userId,
        source: LogSource.WEB,
        action: LogAction.LEAD_CONVERTED,
        type: LogType.INFO,
        details: `Lead dönüştürüldü — hasta: ${saved.patientId ?? '-'}, randevu: ${saved.appointmentId ?? '-'}`,
      });
    });
  }
}
