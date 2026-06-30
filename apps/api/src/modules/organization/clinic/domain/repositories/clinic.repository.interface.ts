import { Clinic as ClinicEntity } from '@modules/organization/clinic/domain/entities/clinic.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ClinicDetails } from '@modules/organization/clinic/domain/contracts/clinic.contracts';

export const CLINIC_COMMAND_REPOSITORY = Symbol('IClinicCommandRepository');
export const CLINIC_QUERY_REPOSITORY = Symbol('IClinicQueryRepository');

export interface IClinicCommandRepository
  extends IBaseCommandRepository<ClinicEntity> {
  softDeleteManyClinicWithAnOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }>;
}

export interface IClinicQueryRepository {
  findById(id: string): Promise<ClinicEntity | null>;
  findByIdWithDetails(id: string): Promise<ClinicDetails | null>;
  findBySlug(slug: string): Promise<ClinicEntity | null>;
  findByIdAsManager(id: string, userId: string): Promise<ClinicEntity | null>;
  findManyByOrganizationId(organizationId: string): Promise<ClinicEntity[]>;
  existsBySlug(slug: string): Promise<boolean>;
  canUserManageClinic(clinicId: string, userId: string): Promise<boolean>;
}
