import { MetaAdAccount } from '@modules/crm/meta-ads/domain/entities/meta-ad-account.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { CreateMetaAdAccountData } from '@modules/crm/meta-ads/domain/meta-ads.contracts';

export const META_AD_ACCOUNT_COMMAND_REPOSITORY = Symbol(
  'IMetaAdAccountCommandRepository'
);
export const META_AD_ACCOUNT_QUERY_REPOSITORY = Symbol(
  'IMetaAdAccountQueryRepository'
);

export interface IMetaAdAccountCommandRepository
  extends IBaseCommandRepository<MetaAdAccount> {
  create(data: CreateMetaAdAccountData): Promise<MetaAdAccount>;
  deactivate(id: string): Promise<void>;
}

export interface IMetaAdAccountQueryRepository {
  findById(id: string): Promise<MetaAdAccount | null>;
  findByClinicId(clinicId: string): Promise<MetaAdAccount[]>;
  findAllActive(): Promise<MetaAdAccount[]>;
  findExpiringSoon(withinDays: number): Promise<MetaAdAccount[]>;
  findByClinicAndAdAccountId(
    clinicId: string,
    adAccountId: string
  ): Promise<MetaAdAccount | null>;
}
