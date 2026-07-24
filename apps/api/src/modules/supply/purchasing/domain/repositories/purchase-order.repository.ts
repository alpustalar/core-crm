import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { PurchaseOrder } from '@modules/supply/purchasing/domain/entities/purchase-order.entity';
import {
  FindPurchaseOrdersFilter,
  PurchaseOrderWithItems,
} from '@modules/supply/purchasing/domain/contracts/purchasing.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const PURCHASE_ORDER_COMMAND_REPOSITORY = Symbol(
  'IPurchaseOrderCommandRepository'
);
export const PURCHASE_ORDER_QUERY_REPOSITORY = Symbol(
  'IPurchaseOrderQueryRepository'
);

export type IPurchaseOrderCommandRepository =
  IBaseCommandRepository<PurchaseOrder>;

export interface IPurchaseOrderQueryRepository {
  findById(id: string): Promise<PurchaseOrderWithItems | null>;
  findByClinic(
    filter: FindPurchaseOrdersFilter
  ): Promise<Paginated<PurchaseOrderWithItems>>;
}
