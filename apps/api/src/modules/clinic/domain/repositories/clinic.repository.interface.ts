import { IOrganization } from '@modules/organization/domain/repositories/organization.repository.interface';
import { Clinic, Prisma } from '@prisma/client';

export const CLINIC_REPO_TOKEN = Symbol('IClinicRepository');

export type IClinic = Clinic;

export type IClinicCreate = Prisma.ClinicUncheckedCreateInput;
export type IClinicUpdate = Prisma.ClinicUncheckedUpdateInput;
export type UpdateAsManagerInput = {
  id: string;
  userId: string;
  data: IClinicUpdate;
};

export type IClinicDetails = IClinic & {
  organization: IOrganization | null;
  managers: {
    id: string;
    displayName: string;
    email: string;
  }[];
  _count: {
    providers: number;
    patients: number;
    appointments: number;
  };
};

export interface IClinicRepository {
  create(data: IClinicCreate): Promise<IClinic>;
  findByIdWithDetails(id: string): Promise<IClinicDetails | null>;
  findBySlug(slug: string): Promise<IClinic | null>;
  update(id: string, data: IClinicUpdate): Promise<IClinic>;
  softDelete(id: string): Promise<IClinic>;
  findByIdAsManager(id: string, userId: string): Promise<IClinic | null>;
  findManyByOrganizationId(organizationId: string): Promise<IClinic[]>;
  softDeleteManyClinicWithAnOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }>;
  updateAsManager({
    id,
    userId,
    data,
  }: UpdateAsManagerInput): Promise<IClinic | null>;
  existsBySlug(slug: string): Promise<boolean>;
  canUserManageClinic(clinicId: string, userId: string): Promise<boolean>;
}
