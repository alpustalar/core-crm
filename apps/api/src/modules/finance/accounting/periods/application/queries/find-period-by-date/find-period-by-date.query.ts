import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { FindPeriodByDateResponse } from './find-period-by-date.response';

export class FindPeriodByDateQuery implements IQuery {
  readonly __responseType!: FindPeriodByDateResponse;
  constructor(
    public readonly clinicId: string,
    public readonly date: Date,
    public readonly ctx: IGetContext
  ) {}
}
