import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClinicCommand } from './update-clinic.command';
import { ForbiddenException, Inject } from '@nestjs/common';
import {
  CLINIC_COMMAND_REPOSITORY,
  IClinicCommandRepository,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';

@CommandHandler(UpdateClinicCommand)
export class UpdateClinicHandler
  implements ICommandHandler<UpdateClinicCommand>
{
  constructor(
    @Inject(CLINIC_COMMAND_REPOSITORY)
    private readonly clinicCommandRepo: IClinicCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: UpdateClinicCommand): Promise<any> {
    const { ctx, clinicId, dto } = command;
    const { actor } = ctx;
    const { policy } = this.policyFactory.clinic(actor);

    const clinic = policy.isSystemAdmin()
      ? await this.clinicCommandRepo.update(clinicId, dto)
      : await this.clinicCommandRepo.updateAsManager({
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
