import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignConsentFormCommand } from './sign-consent-form.command';
import {
  CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY,
  CONSENT_TEMPLATE_COMMAND_REPOSITORY,
  IConsentFormSubmissionCommandRepository,
  IConsentTemplateCommandRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import { ConsentFormSubmission } from '@modules/clinical/consent-form/domain/entities/consent-form-submission.entity';
import {
  ConsentTemplateArchivedException,
  ConsentTemplateNotFoundException,
} from '@modules/clinical/consent-form/domain/exceptions/consent-form.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CONSENT_FORM_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { PatientNotFoundException } from '@modules/crm/patient/domain/exceptions/patient.exceptions';

@CommandHandler(SignConsentFormCommand)
export class SignConsentFormHandler implements ICommandHandler<
  SignConsentFormCommand,
  string
> {
  constructor(
    @Inject(CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY)
    private readonly submissionCommandRepo: IConsentFormSubmissionCommandRepository,
    @Inject(CONSENT_TEMPLATE_COMMAND_REPOSITORY)
    private readonly templateCommandRepo: IConsentTemplateCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: SignConsentFormCommand): Promise<string> {
    const { patientId, data, ctx } = command.payload;
    const { actor } = ctx;

    const organizationId =
      actor.organizationId ?? actor.ownedOrganizations?.[0]?.id ?? '';
    const clinicId = actor.clinicId ?? '';

    this.policyFactory
      .consentForm(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canSignConsentForm(clinicId))
      .orThrow(CONSENT_FORM_EVENTS.SIGN);

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByIdQuery(patientId, ctx)
    );
    if (!patient) throw new PatientNotFoundException();

    return this.txManager.run(async () => {
      const template = await this.templateCommandRepo.findById(data.templateId);
      if (!template) {
        throw new ConsentTemplateNotFoundException(data.templateId);
      }
      if (!template.isActive) {
        throw new ConsentTemplateArchivedException(data.templateId);
      }

      const submission = ConsentFormSubmission.sign({
        organizationId,
        clinicId,
        patientId,
        templateId: template.id.value,
        templateVersion: template.version,
        templateTitleSnapshot: template.title,
        templateContentSnapshot: template.content,
        signatureImage: data.signatureImage,
        signedByUserId: ctx.actor.userId,
        appointmentId: data.appointmentId,
        treatmentId: data.treatmentId,
      });

      const saved = await this.submissionCommandRepo.create(submission);
      return saved.id.value;
    });
  }
}
