import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  CreatePatientPackageWithPaymentInput,
  IPatientTreatmentPackageCommandRepository,
} from '../../../../../domain/repositories/patient-treatment-package.repository.interface';

@Injectable()
export class PatientTreatmentPackageCommandRepository
  extends BaseRepository
  implements IPatientTreatmentPackageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async createWithPayment(input: CreatePatientPackageWithPaymentInput) {
    const { clinicId, price, ...packageProps } = input;

    const payment = await this.db.payment.create({
      data: {
        clinicId,
        patientId: packageProps.patientId,
        totalAmount: price,
        status: PaymentStatus.PENDING,
      },
    });

    return this.db.patientTreatmentPackage.create({
      data: { ...packageProps, paymentId: payment.id },
    });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.db.patientTreatmentPackage.update({ where: { id }, data });
  }
}
