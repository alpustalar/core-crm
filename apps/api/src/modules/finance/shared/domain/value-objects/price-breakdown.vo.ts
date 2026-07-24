import { Money } from '@src/domain/value-objects/money.vo';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface RawPriceBreakdownProps {
  netAmount: string | number | null | undefined;
  vatAmount: string | number | null | undefined;
  grandTotal?: string | number | null | undefined; // Opsiyonel, verilmezse otomatik toplanır
  currency: CurrencyType;
}

export class PriceBreakdown {
  private readonly _netAmount: Money;
  private readonly _vatAmount: Money;
  private readonly _grandTotal: Money;

  // Constructor sadece create fabrikasından geçmiş, zırhlanmış VO'ları kabul eder
  private constructor(netAmount: Money, vatAmount: Money, grandTotal: Money) {
    this._netAmount = netAmount;
    this._vatAmount = vatAmount;
    this._grandTotal = grandTotal;
    Object.freeze(this); // Immutability garanti altına alındı
  }

  // --- Getters (Tip zırhı bozulmaz, dışarıya doğrudan Money VO döner) ---
  get netAmount(): Money {
    return this._netAmount;
  }
  get vatAmount(): Money {
    return this._vatAmount;
  }
  get grandTotal(): Money {
    return this._grandTotal;
  }

  /**
   * 🎯 Senin Esnek Monad Tasarımın
   * Validasyonlar tek bir seferde burada döner, tek bir instance üretilir.
   */
  public static create(props: RawPriceBreakdownProps) {
    const isNetBlank =
      props.netAmount === null ||
      props.netAmount === undefined ||
      props.netAmount === '';
    const isVatBlank =
      props.vatAmount === null ||
      props.vatAmount === undefined ||
      props.vatAmount === '';

    let error: string | undefined;
    let instance: PriceBreakdown | undefined;

    if (!isNetBlank && !isVatBlank) {
      try {
        // 1. Alt bileşenleri güvenli şekilde Money VO'suna çeviriyoruz
        const netMoney = Money.create(
          props.netAmount,
          props.currency
        ).orThrow();
        const vatMoney = Money.create(
          props.vatAmount,
          props.currency
        ).orThrow();

        let grandTotalMoney: Money;

        if (
          props.grandTotal !== null &&
          props.grandTotal !== undefined &&
          props.grandTotal !== ''
        ) {
          grandTotalMoney = Money.create(
            props.grandTotal,
            props.currency
          ).orThrow();
        } else {
          // Eğer grandTotal dışarıdan el ile verilmediyse net + vat olarak hesapla
          grandTotalMoney = netMoney.add(vatMoney);
        }

        // 2. Finansal Denge Kontrolü (Grand Total = Net + KDV)
        const expectedTotal = netMoney.add(vatMoney);

        if (!grandTotalMoney.equals(expectedTotal)) {
          error =
            `Finansal dengesizlik: Genel toplam (${grandTotalMoney.toApiFormat()} ${grandTotalMoney.currency}), ` +
            `Net (${netMoney.toApiFormat()}) + KDV (${vatMoney.toApiFormat()}) toplamına eşit olmalıdır.`;
        } else {
          // Başarılıysa tek instance burada üretilir
          instance = new PriceBreakdown(netMoney, vatMoney, grandTotalMoney);
        }
      } catch (e: any) {
        error = e.message ?? 'Fiyat dökümü oluşturulurken bir hata oluştu.';
      }
    } else {
      error =
        'Net miktar, KDV miktarı ve para birimi alanları boş bırakılamaz.';
    }

    return {
      instance,
      orThrow: (): PriceBreakdown => {
        if (error || !instance)
          throw new Error(error ?? 'PriceBreakdown oluşturulamadı.');
        return instance; // Hafızadaki aynı instance güvenle dışarı fırlatılır
      },
    };
  }

  /** Altyapı ve veri tabanından okurken doğrulanmış veriyi doğrudan bağlamak için */
  public static fromTrusted(
    netAmount: Money,
    vatAmount: Money,
    grandTotal: Money
  ): PriceBreakdown {
    return new PriceBreakdown(netAmount, vatAmount, grandTotal);
  }

  /** Dış dünyaya veya serialization katmanına düz çıktı */
  public toPlain() {
    return {
      netAmount: this._netAmount.toApiFormat(),
      vatAmount: this._vatAmount.toApiFormat(),
      grandTotal: this._grandTotal.toApiFormat(),
      currency: this._grandTotal.currency,
    };
  }
}
