import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { PurchaseRequest } from '@modules/supply/purchasing/domain/entities/purchase-request.entity';
import {
  FindPurchaseRequestsFilter,
  PurchaseRequestWithItems,
} from '@modules/supply/purchasing/domain/contracts/purchasing.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const PURCHASE_REQUEST_COMMAND_REPOSITORY = Symbol(
  'IPurchaseRequestCommandRepository'
);
export const PURCHASE_REQUEST_QUERY_REPOSITORY = Symbol(
  'IPurchaseRequestQueryRepository'
);

export type IPurchaseRequestCommandRepository =
  IBaseCommandRepository<PurchaseRequest>;

export interface IPurchaseRequestQueryRepository {
  findById(id: string): Promise<PurchaseRequestWithItems | null>;
  findByClinic(
    filter: FindPurchaseRequestsFilter
  ): Promise<Paginated<PurchaseRequestWithItems>>;
}
