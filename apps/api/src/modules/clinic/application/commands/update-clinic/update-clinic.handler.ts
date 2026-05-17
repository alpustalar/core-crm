import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClinicCommand } from './update-clinic.command';
import { ForbiddenException, Inject } from '@nestjs/common';
import {
  CLINIC_REPO_TOKEN,
  IClinicRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';

@CommandHandler(UpdateClinicCommand)
export class UpdateClinicHandler
  implements ICommandHandler<UpdateClinicCommand>
{
  constructor(
    @Inject(CLINIC_REPO_TOKEN)
    private readonly clinicRepo: IClinicRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: UpdateClinicCommand): Promise<any> {
    const { context, clinicId, dto } = command;
    const { actor } = context;
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

    return clinic.id;
  }
}
