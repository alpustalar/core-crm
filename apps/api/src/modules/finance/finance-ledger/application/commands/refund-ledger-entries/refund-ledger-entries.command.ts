import { IGetContext } from '@common/decorators';

/**
 * Bir taksitin cari kaydını REFUNDED'a çevirir.
 *
 * Kapsam bilerek **taksit**: iade her zaman tek taksit üzerinden yapılıyor
 * (`PaymentRefundedEvent.installmentId`). Ödeme bazlı çevirmek, çok taksitli
 * planda kısmi iadede hâlâ tahsil edilmiş taksitlerin gelirini de silerdi.
 */
export class RefundLedgerEntriesCommand {
  constructor(
    public readonly installmentId: string,
    public readonly ctx: IGetContext
  ) {}
}
