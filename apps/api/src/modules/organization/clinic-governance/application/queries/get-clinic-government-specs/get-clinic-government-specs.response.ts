import { QueryResponse } from '@shared/common/response/response.interface';
import { ClinicLegalTypeType as ClinicLegalType } from '@input-type-schemas/ClinicLegalTypeSchema';

export interface ClinicGovernmentSpecsView {
  clinicId: string;
  healthFacilityCode: string;
  ussPassword: string | null;
  companyTaxNumber: string | null;
  legalType: ClinicLegalType;
  createdAt: Date;
  updatedAt: Date;
}

/** Kayıt yoksa data null döner. */
export type GetClinicGovernmentSpecsResponse =
  QueryResponse<ClinicGovernmentSpecsView | null>;
