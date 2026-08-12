import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLeadStatusCommand } from './update-lead-status.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead/lead.command.repository';
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
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import { LeadStatusSchema } from '@shared';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(UpdateLeadStatusCommand)
export class UpdateLeadStatusHandler
  implements ICommandHandler<UpdateLeadStatusCommand, void>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadRepo: ILeadCommandRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateLeadStatusCommand): Promise<void> {
    const { leadId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const lead = await this.leadRepo.findById(leadId);
      if (!lead) throw new LeadNotFoundException();

      this.policyFactory
        .clinic(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.actorCanAccessTargetClinic(lead.clinicId.value)
        )
        .orThrow();

      const validateOptions = this.policyFactory
        .entity(ctx.actor, ctx.source)
        .policy.getValidateOptions();

      const previousStatus = lead.status;

      if (data.status === LeadStatusSchema.enum.CONTACTED) {
        lead.rules(validateOptions).contact().orThrow();
        lead.contact();
      } else if (data.status === LeadStatusSchema.enum.QUALIFIED) {
        lead.rules(validateOptions).qualify().orThrow();
        lead.qualify();
      }

      if (data.notes) lead.updateNotes(data.notes);

      const saved = await this.leadRepo.update(lead);

      // TODO: event entity içinde raise edilecek

      this.eventPublisher.leadStatusChanged({
        leadId: lead.id.value,
        clinicId: lead.clinicId.value,
        previousStatus,
        newStatus: saved.status,
        actorId: ctx.actor.userId,
        source: LogSource.WEB,
        action: LogAction.LEAD_STATUS_CHANGED,
        type: LogType.INFO,
        details: `Lead durumu güncellendi: ${previousStatus} -> ${saved.status}`,
      });
    });
  }
}
