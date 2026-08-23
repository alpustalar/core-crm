import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';

export const LEAD_COMMAND_REPOSITORY = Symbol('ILeadCommandRepository');
export interface ILeadCommandRepository extends IBaseCommandRepository<Lead> {
  /**
   * Lead'i `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde.
   * Dönüştürme (convert), aşama/durum değişimi ve kayıp işaretleme aynı satırın
   * durum makinesini ilerletir; kilitsiz okumada iki eşzamanlı dönüştürme isteği
   * de lead'i "açık" görüp iki hasta kaydı yaratabilir.
   */
  findByIdForUpdate(id: string): Promise<Lead | null>;
}
