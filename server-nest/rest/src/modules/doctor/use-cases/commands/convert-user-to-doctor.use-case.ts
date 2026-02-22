import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@modules/prisma/prisma.service';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@common/policy/factory.policy';
import { DoctorRepository } from '@modules/doctor/repositories/doctor.repository';
import { ConvertUserToDoctorDto } from '@shared/modules';

@Injectable()
export class CreateDoctorWithUserUseCase {
  constructor(
    private readonly prisma: PrismaService,
    protected readonly policyFactory: PolicyFactory,
    private readonly doctorRepo: DoctorRepository,
  ) {}

  async execute(
    actor: ActorContext,
    dto: ConvertUserToDoctorDto,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const policy = this.policyFactory.user(actor);

    policy.isTargetInMyClinicForManageOrThrow({ clinicId: dto.clinicId });

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
