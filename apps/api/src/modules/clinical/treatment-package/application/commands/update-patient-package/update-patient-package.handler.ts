import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePatientPackageCommand } from './update-patient-package.command';
import type { UpdatePatientPackageResponse } from './update-patient-package.response';
import {
  IPatientTreatmentPackageCommandRepository,
  PATIENT_TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package.repository.interface';
import { PatientTreatmentPackageNotFoundException } from '@modules/clinical/treatment-package/domain/exceptions/patient-treatment-package.exceptions';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindClinicIdByProviderIdQuery } from '@modules/organization/clinic/application/queries/find-clinic-id-by-provider-id/find-clinic-id-by-provider-id.query';
import { PATIENT_TREATMENT_PACKAGE_EVENTS } from '@src/domain/constants/events';

@CommandHandler(UpdatePatientPackageCommand)
export class UpdatePatientPackageHandler
  implements
    ICommandHandler<UpdatePatientPackageCommand, UpdatePatientPackageResponse>
{
  constructor(
    @Inject(PATIENT_TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly patientTreatmentPackageCommandRepo: IPatientTreatmentPackageCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    command: UpdatePatientPackageCommand
  ): Promise<UpdatePatientPackageResponse> {
    const { payload, ctx } = command;
    const { patientPackageId, data } = payload;

    const patientTreatmentPackage =
      await this.patientTreatmentPackageCommandRepo.findById(patientPackageId);

    if (!patientTreatmentPackage)
      throw new PatientTreatmentPackageNotFoundException();

    const { clinicId } = await this.queryBus.execute(
      new FindClinicIdByProviderIdQuery(
        patientTreatmentPackage.providerId.value
      )
    );

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(clinicId))
      .orThrow(PATIENT_TREATMENT_PACKAGE_EVENTS.UPDATED);

    patientTreatmentPackage.update(data);

    await this.patientTreatmentPackageCommandRepo.save(patientTreatmentPackage);

    return patientTreatmentPackage.id.value;
  }
}
