import { Clinic as ClinicEntity } from '@modules/organization/clinic/domain/entities/clinic.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_COMMAND_REPOSITORY = Symbol('IClinicCommandRepository');

export interface IClinicCommandRepository
  extends IBaseCommandRepository<ClinicEntity> {
  softDeleteManyClinicWithAnOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }>;
}
