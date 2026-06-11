import { IGetContext } from '@common/decorators';

export class OpenPeriodCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly organizationId: string,
    public readonly year: number,
    public readonly ctx: IGetContext
  ) {}
}
