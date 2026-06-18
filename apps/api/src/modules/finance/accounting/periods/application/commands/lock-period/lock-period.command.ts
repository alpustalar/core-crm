import { IGetContext } from '@common/decorators';

/** Açık dönemi kilitler (yeni fiş atılamaz; storno hâlâ bugünün açık dönemine yazılır). */
export class LockPeriodCommand {
  readonly __responseType!: void;
  constructor(
    public readonly periodId: string,
    public readonly ctx: IGetContext
  ) {}
}
