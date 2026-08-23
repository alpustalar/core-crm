import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

/**
 * Randevunun faturası kesilmiş; ticari belge donduğu için dayanağını oluşturan
 * kayıtlar (işlem satırları) artık değiştirilemez.
 *
 * NOT: `errorCode` bilinçli olarak `TREATMENT_CHARGE.ALREADY_INVOICED` — kural
 * invoice modülünde yaşar ama hatayı gören uçlar (satır ekle/indirim/iptal)
 * treatment-charge uçlarıdır ve frontend bu kodu zaten tanıyor. Kod değişirse
 * istemci sözleşmesi bozulurdu.
 */
/**
 * Aynı randevu/ödeme için ikinci bir fatura yazılmaya çalışıldı ve DB'deki unique
 * kısıt (`invoices_appointment_id_key` / `invoices_payment_id_key`) bunu reddetti.
 *
 * Bu yarışı kaybeden taraftır: "önce sorgula, yoksa oluştur" kontrolü ile yazma
 * arasındaki pencerede başka bir istek faturayı kesmiştir. Çağıran bunu yakalayıp
 * kazananın faturasını okur ve idempotent şekilde onu döner.
 */
export class InvoiceDuplicateException extends DomainException {
  public readonly errorCode = ERROR_CODES.INVOICE.DUPLICATE;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(message = 'Bu kayıt için fatura zaten kesilmiş.') {
    super(message);
  }
}

export class AppointmentAlreadyInvoicedException extends DomainException {
  public readonly errorCode = ERROR_CODES.TREATMENT_CHARGE.ALREADY_INVOICED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(appointmentId: string) {
    super(
      `Faturası kesilmiş randevunun işlem satırları değiştirilemez: ${appointmentId}`
    );
  }
}
