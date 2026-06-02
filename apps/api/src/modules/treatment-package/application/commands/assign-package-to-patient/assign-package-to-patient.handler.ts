import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { AssignPackageToPatientCommand } from './assign-package-to-patient.command';
import type { AssignPackageToPatientResponse } from './assign-package-to-patient.response';
import {
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/treatment-package/domain/repositories/treatment-package.repository.interface';
import {
  IPatientTreatmentPackageCommandRepository,
  PATIENT_TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/treatment-package/domain/repositories/patient-treatment-package.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { DateTimeManager } from '@common/utils/date-time.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreatePaymentCommand } from '@modules/payment/application/commands/payment/create-payment/create-payment.command';

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
    private readonly patientPackageCommandRepo: IPatientTreatmentPackageCommandRepository,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus,
  ) {}

  async execute(
    command: AssignPackageToPatientCommand
  ): Promise<AssignPackageToPatientResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    if (!actor.clinicId)
      throw new BadRequestException('Actor için klinik tanımlanmamış.');

    const pkg = await this.treatmentPackageQueryRepo.findById(dto.packageId);

    if (!pkg) throw new NotFoundException('Tedavi paketi bulunamadı');

    const endDate = DateTimeManager.addDays(dto.startDate, pkg.validityDays);

    return this.txManager.run(async () => {
      const paymentId = await this.commandBus.execute(
        new CreatePaymentCommand({
          clinicId: actor.clinicId!,
          patientId: dto.patientId,
          amount: Number(pkg.price),
          providerId: dto.providerId,
        })
      );

      const record = await this.patientPackageCommandRepo.create({
        patientId: dto.patientId,
        packageId: dto.packageId,
        providerId: dto.providerId,
        clinicId: actor.clinicId!,
        startDate: dto.startDate,
        endDate,
        notes: dto.notes,
        paymentId,
      });

      return { id: record.id, paymentId: record.paymentId! };
    });
  }
}
