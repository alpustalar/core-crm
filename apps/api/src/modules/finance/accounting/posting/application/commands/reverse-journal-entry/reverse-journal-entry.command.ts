import { IGetContext } from '@common/decorators';

/**
 * Bir POSTED yevmiye fişini storno (ters kayıt) ile iptal eder. Defter append-only
 * olduğu için kayıt silinmez/düzeltilmez; bugünün açık dönemine borç/alacağı tersine
 * çevrilmiş yeni bir fiş atılır, orijinal REVERSED işaretlenir (doc 04, doc 08).
 * Dönüş: oluşturulan storno fişinin id'si.
 */
export class ReverseJournalEntryCommand {
  readonly __responseType!: string;
  constructor(
    public readonly entryId: string,
    public readonly ctx: IGetContext,
    public readonly reason?: string
  ) {}
}
