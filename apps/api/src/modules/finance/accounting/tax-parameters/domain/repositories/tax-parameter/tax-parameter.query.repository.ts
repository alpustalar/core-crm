import { TaxParameter } from '@shared';
import { TaxParameterKeyType as TaxParameterKey } from '@input-type-schemas/TaxParameterKeySchema';

export const TAX_PARAMETER_QUERY_REPOSITORY = Symbol(
  'ITaxParameterQueryRepository'
);

export interface ITaxParameterQueryRepository {
  /** Belirli tarihte (clinicId, key) için yürürlükteki oran satırı. */
  findEffective(
    clinicId: string,
    key: TaxParameterKey,
    date: Date
  ): Promise<TaxParameter | null>;

  findAllByClinicId(clinicId: string): Promise<TaxParameter[]>;
}
