import { Clinic } from '@prisma/client';
import { UpdateClinic } from '@shared';
import { Clinic as ClinicEntity } from '@modules/clinic/domain/entities/clinic.entity';
import { CreateClinicProps } from '@modules/clinic/domain/types/create-clinic.props';
import { ClinicDetails } from '@modules/clinic/domain/types/clinic-details.type';
import { UpdateAsManagerProps } from '@modules/clinic/domain/types/update-as-manager.props';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const CLINIC_COMMAND_REPOSITORY = Symbol('IClinicCommandRepository');
export const CLINIC_QUERY_REPOSITORY = Symbol('IClinicQueryRepository');

export interface IClinicCommandRepository
  extends IBaseCommandRepository<ClinicEntity> {
  create(props: CreateClinicProps): Promise<Clinic>;
  update(id: string, props: UpdateClinic): Promise<Clinic>;
  softDelete(id: string): Promise<Clinic>;
  softDeleteManyClinicWithAnOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }>;
  updateAsManager(props: UpdateAsManagerProps): Promise<Clinic | null>;
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
