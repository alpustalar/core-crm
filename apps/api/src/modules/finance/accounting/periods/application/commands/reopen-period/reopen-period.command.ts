import { IGetContext } from '@common/decorators';

/** Kilitli dönemi yeniden açar (düzeltme amaçlı). Kapatılmış dönem yeniden açılamaz. */
export class ReopenPeriodCommand {
  readonly __responseType!: void;
  constructor(
    public readonly periodId: string,
    public readonly ctx: IGetContext
  ) {}
}
