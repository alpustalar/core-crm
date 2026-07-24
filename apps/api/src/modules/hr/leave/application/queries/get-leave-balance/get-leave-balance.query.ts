import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetLeaveBalanceResponse } from './get-leave-balance.response';

/** Çalışanın yıllık izin bakiyesi (hak ediş - kullanılan onaylı ANNUAL gün). */
export class GetLeaveBalanceQuery implements IQuery {
  readonly __responseType!: GetLeaveBalanceResponse;
  constructor(
    public readonly employeeId: string,
    public readonly ctx: IGetContext
  ) {}
}
