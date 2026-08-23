import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ExternalWorkOrder } from '@modules/supply/work-order/domain/entities/external-work-order.entity';

export const EXTERNAL_WORK_ORDER_COMMAND_REPOSITORY = Symbol(
  'IExternalWorkOrderCommandRepository'
);
export interface IExternalWorkOrderCommandRepository extends IBaseCommandRepository<ExternalWorkOrder> {
  /**
   * İş emrini kalemleriyle `FOR UPDATE` kilitleyerek yükler — yalnız aktif
   * transaction içinde. Gönder/ilerlet/prova/teslim al/iptal aynı satırın durum
   * makinesini ilerletir; kilitsiz okuma iki eşzamanlı geçişin birbirini
   * ezmesine izin verir (ör. iptal edilmiş emir teslim alınmış görünür).
   */
  findByIdForUpdate(id: string): Promise<ExternalWorkOrder | null>;

  /**
   * Termini geçmiş, henüz teslim alınmamış ve daha önce bildirilmemiş iş emirleri.
   * Tarama komutu bunları okuyup `markOverdueNotified()` ile mutasyona uğrattığı için
   * (CQRS kuralı) Query değil Command repo'dan çekilir.
   */
  findOverdueForNotification(
    now: Date,
    limit: number
  ): Promise<ExternalWorkOrder[]>;
}
