import { TaxParameterKey } from '@prisma/client';
import { TaxParameter } from '../entities/tax-parameter.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const TAX_PARAMETER_COMMAND_REPOSITORY = Symbol(
  'ITaxParameterCommandRepository'
);
export const TAX_PARAMETER_QUERY_REPOSITORY = Symbol(
  'ITaxParameterQueryRepository'
);

export interface ITaxParameterCommandRepository
  extends IBaseCommandRepository<TaxParameter> {
  saveMany(taxParameters: TaxParameter[]): Promise<void>;
}

export interface ITaxParameterQueryRepository {
  /** Belirli tarihte (clinicId, key) için yürürlükteki oran satırı. */
  findEffective(
    clinicId: string,
    key: TaxParameterKey,
    date: Date
  ): Promise<TaxParameter | null>;

  /** (clinicId, key) için açık (validTo=null) güncel sürüm. */
  findOpen(
    clinicId: string,
    key: TaxParameterKey
  ): Promise<TaxParameter | null>;

  /** Şubede hiç vergi parametresi var mı? (Initialize idempotentliği) */
  existsForClinic(clinicId: string): Promise<boolean>;

  findAllByClinicId(clinicId: string): Promise<TaxParameter[]>;
}
