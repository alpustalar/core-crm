import { TaxParameterKeyType } from '@input-type-schemas/TaxParameterKeySchema';

/** Entity.create() için repo-seviyesi props. */
export interface CreateTaxParameterProps {
  clinicId: string;
  organizationId: string;
  key: TaxParameterKeyType;
  rate: number;
  validFrom: Date;
  validTo?: Date | null;
}

/** SetTaxParameterCommand input'u (uygulama seviyesi). */
export interface SetTaxParameterInput {
  clinicId: string;
  organizationId: string;
  key: TaxParameterKeyType;
  rate: number;
  /** Yürürlük başlangıcı; verilmezse şimdi. */
  validFrom?: Date;
}
