import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetPendingLeavesResponse } from './get-pending-leaves.response';

/** Kliniğin bekleyen izin talepleri (onay kutusu). clinicId aktör bağlamından. */
export class GetPendingLeavesQuery implements IQuery {
  readonly __responseType!: GetPendingLeavesResponse;
  constructor(
    public readonly payload: {
      readonly pagination: Pagination;
      readonly clinicId: string;
      readonly ctx: IGetContext;
    }
  ) {}
}
