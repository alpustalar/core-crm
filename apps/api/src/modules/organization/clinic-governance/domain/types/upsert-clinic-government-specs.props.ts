import { ClinicLegalTypeType as ClinicLegalType } from '@input-type-schemas/ClinicLegalTypeSchema';

export interface CreateClinicGovernmentSpecsProps {
  id?: string;
  clinicId: string;
  healthFacilityCode: string;
  ussPassword?: string | null;
  companyTaxNumber?: string | null;
  legalType?: ClinicLegalType;
}

/** Var olan kayıtta güncellenebilir alanlar (healthFacilityCode dahil). */
export interface UpdateClinicGovernmentSpecsProps {
  healthFacilityCode?: string;
  ussPassword?: string | null;
  companyTaxNumber?: string | null;
  legalType?: ClinicLegalType;
}
