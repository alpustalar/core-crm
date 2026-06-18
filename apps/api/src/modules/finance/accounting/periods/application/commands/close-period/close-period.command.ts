import { IGetContext } from '@common/decorators';

/**
 * Dönemi kapatır (doc 04 dönem kapanışı): önce yıl sonu kapanış fişlerini ürettirir
 * (6xx/7xx → 690 → 590/591, posting modülü), sonra dönemi CLOSED'a alır. İkisi atomik.
 * Kapatılmış dönem yeniden açılamaz; düzeltme storno ile yapılır.
 */
export class ClosePeriodCommand {
  readonly __responseType!: void;
  constructor(
    public readonly periodId: string,
    public readonly ctx: IGetContext
  ) {}
}
