import { Injectable } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@modules/policy/policy-factory';
import {
  ProviderRepository
} from '@modules/provider/infrastructure/persistence/prisma/repositories/provider.repository';
import { ConvertUserToProviderDto } from '@shared/modules/provider';

@Injectable()
export class CreateProviderWithUserUseCase {
  constructor(
    protected readonly policyFactory: PolicyFactory,
    private readonly providerRepo: ProviderRepository
  ) {}

  execute(actor: ActorContext, dto: ConvertUserToProviderDto) {
    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInMyClinicForManage({ clinicId: dto.clinicId }))
      .orThrow();

    const { clinicId, userId, titleId, specialtyId, ...rest } = dto;

    const data = {
      ...rest,
      clinic: {
        connect: { id: clinicId },
      },
      user: {
        connect: { id: userId },
      },
      title: {
        connect: { id: titleId as string },
      },
      specialty: {
        connect: { id: specialtyId as string },
      },
    };

    return this.providerRepo.create(data);
  }
}
