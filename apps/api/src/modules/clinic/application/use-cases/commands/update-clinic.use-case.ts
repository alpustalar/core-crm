import { ForbiddenException, Injectable } from '@nestjs/common';
import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { UpdateClinicDto } from '@shared';

@Injectable()
export class UpdateClinicUseCase {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(clinicId: string, dto: UpdateClinicDto, actor: ActorContext) {
    const { policy } = this.policyFactory.clinic(actor);

    const clinic = policy.isSystemAdmin()
      ? await this.clinicRepo.update(clinicId, dto)
      : await this.clinicRepo.updateAsManager({
          id: clinicId,
          userId: actor.userId,
          data: dto,
        });

    if (!clinic) {
      throw new ForbiddenException(
        'Klinik bulunamadı veya güncelleme yetkiniz yok'
      );
    }

    return clinic;
  }
}
