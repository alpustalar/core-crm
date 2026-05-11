import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { UpdateClinicDto } from '@shared';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';

@Injectable()
export class UpdateClinicUseCase {
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
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
