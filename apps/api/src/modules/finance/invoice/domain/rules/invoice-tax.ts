import { Invoice as IInvoice } from '@shared';
import { Money } from '@src/domain/value-objects/money.vo';
import { TaxSpecification } from '@modules/finance/shared/domain/value-objects/tax-specification.vo';

/**
 * Fatura kaydının vergi kırılımını (net / KDV / brüt) üretir. Kural entity'den
 * bağımsızdır: yazma tarafı entity üzerinden, okuma tarafı düz kayıt üzerinden
 * aynı VO'yu kurar — tutar aritmetiği iki yerde ayrı ayrı yazılmaz.
 */
export function taxSpecificationOf(
  invoice: Pick<IInvoice, 'netTotal' | 'vatTotal' | 'vatRate' | 'currency'>
): TaxSpecification {
  return TaxSpecification.create(
    Money.fromTrusted(invoice.netTotal, invoice.currency),
    invoice.vatRate,
    Money.fromTrusted(invoice.vatTotal, invoice.currency)
  );
}
