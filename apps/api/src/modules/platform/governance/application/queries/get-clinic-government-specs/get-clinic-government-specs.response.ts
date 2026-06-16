import { QueryResponse } from '@shared/common/response/response.interface';

export interface ClinicGovernmentSpecsView {
  clinicId: string;
  healthFacilityCode: string;
  ussPassword: string | null;
  companyTaxNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Kayıt yoksa data null döner. */
export type GetClinicGovernmentSpecsResponse =
  QueryResponse<ClinicGovernmentSpecsView | null>;
