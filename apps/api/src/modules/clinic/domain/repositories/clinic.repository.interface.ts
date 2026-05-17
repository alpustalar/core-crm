import { Clinic } from '@prisma/client';
import { CreateClinicDto, Organization, UpdateClinicDto } from '@shared';

export const CLINIC_REPO_TOKEN = Symbol('IClinicRepository');

export type UpdateAsManagerInput = {
  id: string;
  userId: string;
  data: UpdateClinicDto;
};

export type ClinicDetails = Clinic & {
  organization: Organization | null;
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
  create(data: CreateClinicDto): Promise<Clinic>;
  findByIdWithDetails(id: string): Promise<ClinicDetails | null>;
  findBySlug(slug: string): Promise<Clinic | null>;
  update(id: string, data: UpdateClinicDto): Promise<Clinic>;
  softDelete(id: string): Promise<Clinic>;
  findByIdAsManager(id: string, userId: string): Promise<Clinic | null>;
  findManyByOrganizationId(organizationId: string): Promise<Clinic[]>;
  softDeleteManyClinicWithAnOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }>;
  updateAsManager({
    id,
    userId,
    data,
  }: UpdateAsManagerInput): Promise<Clinic | null>;
  existsBySlug(slug: string): Promise<boolean>;
  canUserManageClinic(clinicId: string, userId: string): Promise<boolean>;
}
