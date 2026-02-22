import { ClinicRepository } from '../../repositories/clinic.repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActorContext } from '@common/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindManyByOrganizationIdUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    organizationId: string,
    actor?: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return await this.clinicRepo.findManyByOrganizationId(
      organizationId,
      client,
    );
  }
}
