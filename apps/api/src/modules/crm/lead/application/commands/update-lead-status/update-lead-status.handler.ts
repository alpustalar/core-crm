import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLeadStatusCommand } from './update-lead-status.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead/lead.command.repository';
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
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateLeadStatusCommand): Promise<void> {
    const { leadId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const lead = await this.leadRepo.findByIdForUpdate(leadId);
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

      // Durum değişikliği event'ini entity raise eder (önceki durumu kendisi
      // bilir); repo `update()` içinde flush edilir. Handler yalnız yönlendirir.
      const audit = {
        actorId: ctx.actor.userId,
        logSource: ctx.actor.source,
      };

      if (data.status === LeadStatusSchema.enum.CONTACTED) {
        lead.rules(validateOptions).contact().orThrow();
        lead.contact(audit);
      } else if (data.status === LeadStatusSchema.enum.QUALIFIED) {
        lead.rules(validateOptions).qualify().orThrow();
        lead.qualify(audit);
      }

      if (data.notes) lead.updateNotes(data.notes);

      await this.leadRepo.update(lead);
    });
  }
}
