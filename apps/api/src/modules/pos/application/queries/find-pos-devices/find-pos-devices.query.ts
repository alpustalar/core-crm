import { IGetContext } from '@common/decorators/get-context.decorator';

export class FindPosDevicesQuery {
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
