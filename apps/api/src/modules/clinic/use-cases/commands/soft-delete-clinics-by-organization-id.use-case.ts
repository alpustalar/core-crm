import { ClinicRepository } from '../../repositories/clinic.repository';
import { Prisma } from '@prisma/client';
import { ClinicEventPublisher } from '../../events/publisher';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SoftDeleteClinicsByOrganizationIdUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly publisher: ClinicEventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    organizationId: string,
    userId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const clinics = await this.clinicRepo.findManyByOrganizationId(
      organizationId,
      client,
    );

    if (clinics.length === 0) return;

    await this.clinicRepo.softDeleteByOrganizationId(organizationId, client);

    await Promise.all(
      clinics.map((clinic) =>
        this.publisher.deleteClinic({
          clinicId: clinic.id,
          clinicName: clinic.name,
          organizationId,
          userId,
        }),
      ),
    );
  }
}
