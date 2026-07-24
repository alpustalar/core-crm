import { IGetContext } from '@common/decorators';

export class OpenPeriodCommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      clinicId: string;
      year: number;
      ctx: IGetContext;
    }
  ) {}
}
