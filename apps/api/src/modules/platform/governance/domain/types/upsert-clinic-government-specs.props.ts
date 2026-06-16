export interface CreateClinicGovernmentSpecsProps {
  id?: string;
  clinicId: string;
  healthFacilityCode: string;
  ussPassword?: string | null;
  companyTaxNumber?: string | null;
}

/** Var olan kayıtta güncellenebilir alanlar (healthFacilityCode dahil). */
export interface UpdateClinicGovernmentSpecsProps {
  healthFacilityCode?: string;
  ussPassword?: string | null;
  companyTaxNumber?: string | null;
}
