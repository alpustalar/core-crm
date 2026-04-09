import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { DoctorRepository } from '@modules/doctor/infrastructure/persistence/prisma/repositories/doctor.repository';
import { ConvertUserToDoctorDto } from '@shared/modules/index';

@Injectable()
export class CreateDoctorWithUserUseCase {
  constructor(
    private readonly prisma: PrismaService,
    protected readonly policyFactory: PolicyFactory,
    private readonly doctorRepo: DoctorRepository
  ) {}

  async execute(
    actor: ActorContext,
    dto: ConvertUserToDoctorDto,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? this.prisma;
    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInMyClinicForManage({ clinicId: dto.clinicId }))
      .orThrow();

    const { clinicId, userId, ...rest } = dto;

    const data = {
      ...rest,
      clinic: {
        connect: { id: clinicId },
      },
      user: {
        connect: { id: userId },
      },
    };

    return await this.doctorRepo.create(data, client);
  }
}
