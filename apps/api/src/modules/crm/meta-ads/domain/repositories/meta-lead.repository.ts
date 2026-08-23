import { MetaLead as IMetaLead } from '@shared';
import { MetaLead } from '@modules/crm/meta-ads/domain/entities/meta-lead.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { FindMetaLeadsFilter } from '@modules/crm/meta-ads/domain/contracts/meta-ads.contracts';

export const META_LEAD_COMMAND_REPOSITORY = Symbol(
  'IMetaLeadCommandRepository'
);
export const META_LEAD_QUERY_REPOSITORY = Symbol('IMetaLeadQueryRepository');

export interface IMetaLeadCommandRepository
  extends IBaseCommandRepository<MetaLead> {
  /**
   * Webhook idempotentliği: aynı lead iki kez gelirse ikinci kayıt açılmaz.
   * Yazma kararını beslediği için Command Context'te okunur; nihai güvence
   * `metaLeadId` unique kısıtı.
   */
  findByMetaLeadId(metaLeadId: string): Promise<MetaLead | null>;

  /** Randevu tamamlanınca "dönüştü" işaretlenecek lead (mutasyon okuması). */
  findMatchedLeadByPatientId(patientId: string): Promise<MetaLead | null>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IMetaLeadQueryRepository {
  findMany(
    filter: FindMetaLeadsFilter
  ): Promise<{ items: IMetaLead[]; total: number }>;
  countByAccountAndStatus(
    metaAdAccountId: string,
    status: string
  ): Promise<number>;
}
