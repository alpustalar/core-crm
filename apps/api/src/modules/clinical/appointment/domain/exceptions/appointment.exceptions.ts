import { DomainException } from '@src/domain/exceptions/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { HttpStatus } from '@nestjs/common';

export class AppointmentNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.APPOINTMENT.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(message = 'Randevu bulunamadı.') {
    super(message);
  }
}

export class AppointmentCancellationTimeException extends DomainException {
  public readonly errorCode = ERROR_CODES.APPOINTMENT.INVALID_DATE;

  constructor(message = 'Geçmiş bir tarihe/zamana ait iptal kaydı girilemez.') {
    super(message);
  }
}

export class InvalidAppointmentCancellationException extends DomainException<{
  appointmentId?: string;
}> {
  readonly errorCode = ERROR_CODES.APPOINTMENT.INVALID_CANCELLATION_USER;

  constructor(appointmentId?: string) {
    super('Randevuyu iptal eden kullanıcı bilgisi boş olamaz.', {
      appointmentId,
    });
  }
}

export class AppointmentCancellationNotAllowedException extends DomainException<{
  appointmentId?: string;
  status?: string;
}> {
  readonly errorCode = ERROR_CODES.APPOINTMENT.INVALID_CANCELLATION_STATUS;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(appointmentId?: string, status?: string) {
    super(
      'Tamamlanan, iptal edilmiş veya randevuya gelmedi olarak işaretlenmiş randevular iptal edilemez.',
      {
        appointmentId,
        status,
      }
    );
  }
}

/**
 * Klinik ayarında hastanın kendi randevusunu iptal etmesi kapalıyken
 * (allowPatientCancel = false) fırlatılır. Hasta panelden iptal edemez; klinik
 * ile iletişime geçmelidir.
 */
export class PatientCancellationDisabledException extends DomainException {
  public readonly errorCode = ERROR_CODES.APPOINTMENT.PATIENT_CANCEL_DISABLED;
  public override readonly httpStatus = HttpStatus.FORBIDDEN;

  constructor(
    message = 'Randevunuzu panel üzerinden iptal edemezsiniz. Lütfen klinik ile iletişime geçin.'
  ) {
    super(message);
  }
}
