import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConvertLeadCommand } from './convert-lead.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  LeadConvertMissingTargetException,
  LeadNotFoundException,
} from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { GetPipelineByIdQuery } from '@modules/crm/pipeline/application/queries/get-pipeline-by-id/get-pipeline-by-id.query';
import { CreatePatientCommand } from '@modules/crm/patient/application/commands/create-patient/create-patient.command';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { PipelineStageTypeSchema } from '@shared/modules/pipeline';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';

@CommandHandler(ConvertLeadCommand)
export class ConvertLeadHandler
  implements ICommandHandler<ConvertLeadCommand, void>
{
  private readonly internalCtx = ExecutionContextFactory.createInternal();
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadRepo: ILeadCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ConvertLeadCommand): Promise<void> {
    const { leadId, data, ctx } = command.payload;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(data.clinicId))
      .orThrow();

    await this.txManager.run(async () => {
      const lead = await this.leadRepo.findById(leadId);
      if (!lead) throw new LeadNotFoundException();

      // patientId verilmediyse lead'in telefon+isminden hastayı çöz-veya-oluştur
      // (idempotent). Ne hasta ne de randevu bağlanamıyorsa dönüşecek hedef yoktur.
      const patientId =
        data.patientId ?? (await this.resolvePatientFromLead(lead));
      if (!patientId && !data.appointmentId) {
        throw new LeadConvertMissingTargetException(leadId);
      }

      const validateOptions = this.policyFactory
        .entity(ctx.actor, ctx.source)
        .policy.getValidateOptions();

      lead.rules(validateOptions).convert().orThrow();

      lead.convert({
        patientId,
        appointmentId: data.appointmentId,
        actor: ctx.actor,
      });

      // Kanban tutarlılığı: lead bir huniye bağlıysa WON aşamasına taşı.
      await this.syncWonStage(lead);

      await this.leadRepo.update(lead);
    });
  }

  /**
   * Lead'in telefon+isminden CRM hasta kaydını çöz-veya-oluşturur (kayıt/login değil).
   * CreatePatientCommand telefona göre idempotenttir. Telefon veya isim yoksa oluşturmaz.
   */
  private async resolvePatientFromLead(
    lead: Lead
  ): Promise<string | undefined> {
    const phone = lead.phone?.value;
    const firstName = lead.name?.value;
    if (!phone || !firstName) return undefined;

    return this.commandBus.execute(
      new CreatePatientCommand({
        phone,
        firstName,
        organizationId: lead.organizationId.value,
        clinicId: lead.clinicId.value,
      })
    );
  }

  /** Lead'in hunisindeki WON tipli aşamayı bulup stageId'yi senkronlar (varsa). */
  private async syncWonStage(lead: Lead): Promise<void> {
    if (!lead.pipelineId) return;

    const { data: pipeline } = await this.queryBus.execute(
      new GetPipelineByIdQuery(lead.pipelineId, this.internalCtx)
    );
    const wonStage = pipeline?.stages.find(
      (pipelineStage) => pipelineStage.type === PipelineStageTypeSchema.enum.WON
    );
    if (pipeline && wonStage) {
      lead.assignStage({ pipelineId: pipeline.id, stageId: wonStage.id });
    }
  }
}
