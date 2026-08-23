import { MetaAdAccount as IMetaAdAccount } from '@shared';
import { MetaAdAccount } from '@modules/crm/meta-ads/domain/entities/meta-ad-account.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const META_AD_ACCOUNT_COMMAND_REPOSITORY = Symbol(
  'IMetaAdAccountCommandRepository'
);
export const META_AD_ACCOUNT_QUERY_REPOSITORY = Symbol(
  'IMetaAdAccountQueryRepository'
);

export interface IMetaAdAccountCommandRepository
  extends IBaseCommandRepository<MetaAdAccount> {
  deactivate(id: string): Promise<void>;

  /**
   * Aynı hesabın ikinci kez bağlanmasını engelleyen kontrol. Kaydın açılıp
   * açılmayacağını belirlediği için Command Context'te okunur; nihai güvence
   * `clinicId_adAccountId` unique kısıtı.
   */
  findByClinicAndAdAccountId(
    clinicId: string,
    adAccountId: string
  ): Promise<MetaAdAccount | null>;

  /**
   * Token'ı yakında dolacak hesaplar — yenileme işinin aday listesi (her aday
   * güncellenecek). Tarama bir yazmayı beslediği için Command Context'tedir.
   */
  findExpiringSoon(withinDays: number): Promise<MetaAdAccount[]>;

  /** Metrik senkronu aday listesi: klinik verilmezse tüm aktif hesaplar. */
  findSyncCandidates(clinicId?: string): Promise<MetaAdAccount[]>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IMetaAdAccountQueryRepository {
  findByClinicId(clinicId: string): Promise<IMetaAdAccount[]>;
  findAllActive(): Promise<IMetaAdAccount[]>;
}
