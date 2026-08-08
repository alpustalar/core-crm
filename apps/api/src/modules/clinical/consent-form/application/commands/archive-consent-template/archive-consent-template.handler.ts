import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArchiveConsentTemplateCommand } from './archive-consent-template.command';

import { ConsentTemplateNotFoundException } from '@modules/clinical/consent-form/domain/exceptions/consent-form.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CONSENT_TEMPLATE_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import {
  CONSENT_TEMPLATE_COMMAND_REPOSITORY,
  IConsentTemplateCommandRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-template/consent-template.command.repository';

@CommandHandler(ArchiveConsentTemplateCommand)
export class ArchiveConsentTemplateHandler
  implements ICommandHandler<ArchiveConsentTemplateCommand, void>
{
  constructor(
    @Inject(CONSENT_TEMPLATE_COMMAND_REPOSITORY)
    private readonly consentTemplateRepo: IConsentTemplateCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ArchiveConsentTemplateCommand): Promise<void> {
    const { templateId, ctx } = command;

    await this.txManager.run(async () => {
      const template = await this.consentTemplateRepo.findById(templateId);
      if (!template) throw new ConsentTemplateNotFoundException(templateId);

      this.policyFactory
        .consentForm(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageConsentTemplates(template.clinicId.value)
        )
        .orThrow(CONSENT_TEMPLATE_EVENTS.ARCHIVE);

      template.archive();

      await this.consentTemplateRepo.update(template);
    });
  }
}
