import { ClinicRepository } from '../../repositories/clinic.repository';
import { ClinicEventPublisher } from '../../events/publisher';
import { Clinic, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { SoftDeleteManyUserForCascadeUseCase } from '@modules/user/use-cases/commands/soft-delete-many-user-for-cascade-use.case';

@Injectable()
export class SoftDeleteClinicUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly publisher: ClinicEventPublisher,
    private readonly prisma: PrismaService,
    private readonly softDeleteManyUserForCascadeUseCase: SoftDeleteManyUserForCascadeUseCase,
  ) {}

  async execute(
    clinicId: string,
    actor?: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    const removedClinic = await this.prisma.$transaction(async () => {
      const removedClinics = await this.clinicRepo.softDelete(clinicId, client);
      await this.softDeleteManyUserForCascadeUseCase.execute(clinicId, client);
      return removedClinics;
    });

    await this.publish(removedClinic, actor?.userId);
    return removedClinic;
  }

  async publish(removedClinic: Clinic, userId?: ActorContext['userId']) {
    await this.publisher.deleteClinic({
      clinicName: removedClinic.name,
      clinicId: removedClinic.id,
      organizationId: removedClinic?.organizationId ?? undefined,
      userId,
    });
  }
}
