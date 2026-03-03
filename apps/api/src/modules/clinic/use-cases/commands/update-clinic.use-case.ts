import { ForbiddenException, Injectable } from '@nestjs/common';
import { ClinicRepository } from '../../repositories/clinic.repository';
import { ActorContext } from '@common/interfaces';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PolicyFactory } from '@common/policy/factory.policy';
import { UpdateClinicDto } from '@shared/modules/clinic';

@Injectable()
export class UpdateClinicUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly prisma: PrismaService,
    private readonly policyFactory: PolicyFactory,
  ) {}

  async execute(
    clinicId: string,
    dto: UpdateClinicDto,
    actor: ActorContext,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const policy = this.policyFactory.clinic(actor);

    const clinic = policy.isSystemAdmin()
      ? await this.clinicRepo.update(clinicId, dto)
      : await this.clinicRepo.updateAsManager(
          clinicId,
          actor.userId,
          dto,
          client,
        );

    if (!clinic) {
      throw new ForbiddenException('klinik bulunamadı');
    }
    return clinic;
  }
}
