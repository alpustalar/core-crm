import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindPosDevicesResponse } from './find-pos-devices.response';

export class FindPosDevicesQuery implements IQuery {
  readonly __responseType!: FindPosDevicesResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
