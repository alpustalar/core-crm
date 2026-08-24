import { Decimal } from 'decimal.js';
import { TreatmentCharge } from '@modules/finance/treatment-charge/domain/entities/treatment-charge.entity';
import { AppointmentChargeSummary } from '@modules/finance/treatment-charge/domain/contracts/treatment-charge';
import {
  ChargeCurrencyMismatchException,
  MixedVatRateException,
  NoChargesForAppointmentException,
} from '@modules/finance/treatment-charge/domain/exceptions/treatment-charge.exceptions';

/**
 * Satır toplamlarının **tek hesap noktası**. Fatura da tahsilat da buradan
 * beslenir; iki yerde ayrı toplama yapılırsa er ya da geç kuruş farkı doğar.
 *
 * Toplama satır bazında yapılır (satır tutarları zaten 2 haneye yuvarlanmıştır),
 * böylece fatura toplamı ile satırların toplamı birebir tutar — "faturada 1
 * kuruş fark" sınıfı hataların kaynağı budur.
 */
export class ChargeTotalsCalculator {
  /**
   * Bir randevunun satırlarını özetler.
   *
   * Fatura başlığı tek KDV oranı ve tek para birimi taşıdığı için (`Invoice`),
   * karışık oran/para birimi burada reddedilir — sessizce ortalama almak
   * matrahı bozar ve beyanı yanlışlar.
   */
  public static summarize(
    appointmentId: string,
    charges: TreatmentCharge[]
  ): AppointmentChargeSummary {
    const active = charges.filter((charge) => !charge.isVoided);

    if (active.length === 0) {
      throw new NoChargesForAppointmentException(appointmentId);
    }

    const first = active[0];
    const currency = first.listPrice.currency;
    const vatRate = first.vatRate.value.toNumber();

    for (const charge of active) {
      if (charge.listPrice.currency !== currency) {
        throw new ChargeCurrencyMismatchException(appointmentId);
      }
      if (charge.vatRate.value.toNumber() !== vatRate) {
        throw new MixedVatRateException(appointmentId);
      }
    }

    const zero = new Decimal(0);

    const listTotal = active.reduce(
      (sum, charge) => sum.plus(charge.listTotal.value),
      zero
    );
    const discountTotal = active.reduce(
      (sum, charge) => sum.plus(charge.discountAmount.value),
      zero
    );
    const netTotal = active.reduce(
      (sum, charge) => sum.plus(charge.netAmount.value),
      zero
    );
    const vatTotal = active.reduce(
      (sum, charge) => sum.plus(charge.vatAmount.value),
      zero
    );
    const grandTotal = active.reduce(
      (sum, charge) => sum.plus(charge.grossAmount.value),
      zero
    );

    return {
      appointmentId,
      clinicId: first.clinicId.value,
      patientId: first.patientId.value,
      currency,
      listTotal: listTotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      netTotal: netTotal.toFixed(2),
      vatTotal: vatTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      vatRate,
      lineCount: active.length,
    };
  }
}
