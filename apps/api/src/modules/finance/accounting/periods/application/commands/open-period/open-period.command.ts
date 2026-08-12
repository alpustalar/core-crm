import { IGetContext } from '@common/decorators';

export class OpenPeriodCommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      readonly clinicId: string;
      readonly organizationId?: string | null;
      readonly year: number;
      readonly ctx: IGetContext;
    }
  ) {}
}
