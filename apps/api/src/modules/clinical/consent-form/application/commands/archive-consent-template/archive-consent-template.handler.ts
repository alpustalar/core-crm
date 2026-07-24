import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArchiveConsentTemplateCommand } from './archive-consent-template.command';
import {
  CONSENT_TEMPLATE_COMMAND_REPOSITORY,
  IConsentTemplateCommandRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import { ConsentTemplateNotFoundException } from '@modules/clinical/consent-form/domain/exceptions/consent-form.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  CONSENT_FORM_EVENT_PUBLISHER,
  IConsentFormEventPublisher,
} from '@modules/clinical/consent-form/domain/interfaces/consent-form-event-publisher.interface';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { CONSENT_TEMPLATE_EVENTS } from '@src/domain/constants/events/consent-form.constant';

@CommandHandler(ArchiveConsentTemplateCommand)
export class ArchiveConsentTemplateHandler implements ICommandHandler<
  ArchiveConsentTemplateCommand,
  void
> {
  constructor(
    @Inject(CONSENT_TEMPLATE_COMMAND_REPOSITORY)
    private readonly templateCommandRepo: IConsentTemplateCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(CONSENT_FORM_EVENT_PUBLISHER)
    private readonly eventPublisher: IConsentFormEventPublisher,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ArchiveConsentTemplateCommand): Promise<void> {
    const { templateId, ctx } = command;

    await this.txManager.run(async () => {
      const template = await this.templateCommandRepo.findById(templateId);
      if (!template) throw new ConsentTemplateNotFoundException(templateId);

      this.policyFactory
        .consentForm(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.canManageConsentTemplates(template.clinicId.value)
        )
        .orThrow(CONSENT_TEMPLATE_EVENTS.ARCHIVE);

      template.archive();
      await this.templateCommandRepo.save(template);

      this.eventPublisher.templateArchived({
        templateId: template.id.value,
        clinicId: template.clinicId.value,
        actorId: ctx.actor.userId,
        source: LogSource.WEB,
        action: LogAction.CONSENT_TEMPLATE_ARCHIVE,
        type: LogType.INFO,
        details: `Onam formu şablonu arşivlendi: ${template.title}`,
      });
    });
  }
}
