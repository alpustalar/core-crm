import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AssignPackageToPatientCommand } from './assign-package-to-patient.command';
import type { AssignPackageToPatientResponse } from './assign-package-to-patient.response';
import {
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import {
  IPatientTreatmentPackageCommandRepository,
  PATIENT_TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreatePaymentCommand } from '@modules/finance/payment/application/commands/create-payment/create-payment.command';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';
import { TreatmentPackageNotFoundException } from '@modules/clinical/treatment-package/domain/exceptions/treatment-package.exceptions';
import { PatientTreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/patient-treatment-package.entity';
import { UUID } from '@src/domain/value-objects/uuid.vo';

@CommandHandler(AssignPackageToPatientCommand)
export class AssignPackageToPatientHandler
  implements
    ICommandHandler<
      AssignPackageToPatientCommand,
      AssignPackageToPatientResponse
    >
{
  constructor(
    @Inject(TREATMENT_PACKAGE_QUERY_REPO)
    private readonly treatmentPackageQueryRepo: ITreatmentPackageQueryRepository,
    @Inject(PATIENT_TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly patientTreatmentPackageCommandRepo: IPatientTreatmentPackageCommandRepository,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(
    command: AssignPackageToPatientCommand
  ): Promise<AssignPackageToPatientResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    if (!actor.clinicId) throw new ClinicNotAssignedException();
    const actorClinicId = actor.clinicId;

    const pkg = await this.treatmentPackageQueryRepo.findById(dto.packageId);
    if (!pkg) throw new TreatmentPackageNotFoundException();

    const endDate = DateTimeManager.addDays(dto.startDate, pkg.validityDays);
    const generatedPaymentId = UUID.generate().value;

    return this.txManager.run(async () => {
      await this.commandBus.execute(
        new CreatePaymentCommand(
          {
            clinicId: actorClinicId,
            patientId: dto.patientId,
            amount: Number(pkg.price.amount),
            providerId: dto.providerId,
            currency: pkg.price.currency,
            method: dto.method,
          },
          { paymentId: generatedPaymentId }
        )
      );

      const patientTreatmentPkg = PatientTreatmentPackage.create({
        patientId: dto.patientId,
        packageId: dto.packageId,
        providerId: dto.providerId,
        startDate: dto.startDate,
        endDate,
        notes: dto.notes,
        paymentId: generatedPaymentId,
      });

      await this.patientTreatmentPackageCommandRepo.create(patientTreatmentPkg);

      return {
        id: patientTreatmentPkg.id.value,
        paymentId: generatedPaymentId,
      };
    });
  }
}
