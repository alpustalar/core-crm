import { MetaAdAccount } from '@modules/meta-ads/domain/entities/meta-ad-account.entity';
import { CreateMetaAdAccountProps } from '@modules/meta-ads/domain/types/create-meta-ad-account.props';

export const META_AD_ACCOUNT_COMMAND_REPOSITORY = Symbol(
  'IMetaAdAccountCommandRepository',
);
export const META_AD_ACCOUNT_QUERY_REPOSITORY = Symbol(
  'IMetaAdAccountQueryRepository',
);

export interface IMetaAdAccountCommandRepository {
  create(props: CreateMetaAdAccountProps): Promise<MetaAdAccount>;
  save(entity: MetaAdAccount): Promise<MetaAdAccount>;
  deactivate(id: string): Promise<void>;
}

export interface IMetaAdAccountQueryRepository {
  findById(id: string): Promise<MetaAdAccount | null>;
  findByClinicId(clinicId: string): Promise<MetaAdAccount[]>;
  findAllActive(): Promise<MetaAdAccount[]>;
  findByClinicAndAdAccountId(
    clinicId: string,
    adAccountId: string,
  ): Promise<MetaAdAccount | null>;
}
