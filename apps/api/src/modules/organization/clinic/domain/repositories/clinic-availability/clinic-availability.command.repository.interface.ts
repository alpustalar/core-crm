import { ClinicAvailability } from '@modules/organization/clinic/domain/entities/clinic-availability.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_AVAILABILITY_COMMAND_REPOSITORY = Symbol(
  'IClinicAvailabilityCommandRepository'
);

export interface IClinicAvailabilityCommandRepository
  extends IBaseCommandRepository<ClinicAvailability> {
  findByClinicAndDay(
    clinicId: string,
    dayOfWeek: number
  ): Promise<ClinicAvailability | null>;
  findAllByClinicId(clinicId: string): Promise<ClinicAvailability[]>;
}
