import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ExternalWorkOrder } from '@modules/supply/work-order/domain/entities/external-work-order.entity';
import {
  ExternalWorkOrderWithItems,
  FindWorkOrdersFilter,
  WorkOrderSummary,
} from '@modules/supply/work-order/domain/contracts/work-order.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const EXTERNAL_WORK_ORDER_COMMAND_REPOSITORY = Symbol(
  'IExternalWorkOrderCommandRepository'
);
export const EXTERNAL_WORK_ORDER_QUERY_REPOSITORY = Symbol(
  'IExternalWorkOrderQueryRepository'
);

export interface IExternalWorkOrderCommandRepository
  extends IBaseCommandRepository<ExternalWorkOrder> {
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

export interface IExternalWorkOrderQueryRepository {
  findById(id: string): Promise<ExternalWorkOrderWithItems | null>;
  findByClinic(
    filter: FindWorkOrdersFilter
  ): Promise<Paginated<ExternalWorkOrderWithItems>>;
  summarizeByClinic(clinicId: string, now: Date): Promise<WorkOrderSummary>;
}
