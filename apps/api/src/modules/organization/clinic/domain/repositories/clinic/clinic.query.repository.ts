import { ClinicDetails } from '@modules/organization/clinic/domain/contracts/clinic.contracts';
import { Clinic } from '@shared';

export const CLINIC_QUERY_REPOSITORY = Symbol('IClinicQueryRepository');

export interface IClinicQueryRepository {
  findById(id: string): Promise<Clinic | null>;
  findByIdWithDetails(id: string): Promise<ClinicDetails | null>;
  findBySlug(slug: string): Promise<Clinic | null>;
  findByIdAsManager(id: string, userId: string): Promise<Clinic | null>;
  findManyByOrganizationId(organizationId: string): Promise<Clinic[]>;
  existsBySlug(slug: string): Promise<boolean>;
  canUserManageClinic(clinicId: string, userId: string): Promise<boolean>;
  findIdByProviderId(providerId: string): Promise<string | null>;
  findIdByPatientId(patientId: string): Promise<string | null>;
}
