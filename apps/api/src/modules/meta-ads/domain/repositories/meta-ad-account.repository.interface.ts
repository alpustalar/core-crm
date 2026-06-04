import { MetaAdAccount } from '@modules/meta-ads/domain/entities/meta-ad-account.entity';
import { CreateMetaAdAccountProps } from '@modules/meta-ads/domain/types/create-meta-ad-account.props';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const META_AD_ACCOUNT_COMMAND_REPOSITORY = Symbol(
  'IMetaAdAccountCommandRepository',
);
export const META_AD_ACCOUNT_QUERY_REPOSITORY = Symbol(
  'IMetaAdAccountQueryRepository',
);

export interface IMetaAdAccountCommandRepository
  extends IBaseCommandRepository<MetaAdAccount> {
  create(props: CreateMetaAdAccountProps): Promise<MetaAdAccount>;
  deactivate(id: string): Promise<void>;
}

export interface IMetaAdAccountQueryRepository {
  findById(id: string): Promise<MetaAdAccount | null>;
  findByClinicId(clinicId: string): Promise<MetaAdAccount[]>;
  findAllActive(): Promise<MetaAdAccount[]>;
  findExpiringSoon(withinDays: number): Promise<MetaAdAccount[]>;
  findByClinicAndAdAccountId(
    clinicId: string,
    adAccountId: string,
  ): Promise<MetaAdAccount | null>;
}
