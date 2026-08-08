import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateConsentTemplateCommand } from './create-consent-template.command';

import { ConsentFormTemplate } from '@modules/clinical/consent-form/domain/entities/consent-form-template.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CONSENT_TEMPLATE_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicOrganizationIdQuery } from '@modules/organization/clinic/application/queries/get-clinic-organization-id/get-clinic-organization-id.query';
import {
  CONSENT_TEMPLATE_COMMAND_REPOSITORY,
  IConsentTemplateCommandRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-template/consent-template.command.repository';

@CommandHandler(CreateConsentTemplateCommand)
export class CreateConsentTemplateHandler
  implements ICommandHandler<CreateConsentTemplateCommand, string>
{
  constructor(
    @Inject(CONSENT_TEMPLATE_COMMAND_REPOSITORY)
    private readonly consentTemplateRepo: IConsentTemplateCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: CreateConsentTemplateCommand): Promise<string> {
    const { data, ctx } = command;

    const { data: organizationId } = await this.queryBus.execute(
      new GetClinicOrganizationIdQuery(data.clinicId)
    );

    this.policyFactory
      .consentForm(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageConsentTemplates(data.clinicId))
      .orThrow(CONSENT_TEMPLATE_EVENTS.CREATE);

    const template = ConsentFormTemplate.create({
      organizationId,
      clinicId: data.clinicId,
      sectorId: data.sectorId,
      title: data.title,
      content: data.content,
      createdByUserId: ctx.actor.userId,
    });

    return this.txManager.run(async () => {
      await this.consentTemplateRepo.create(template);
      return template.id.value;
    });
  }
}
