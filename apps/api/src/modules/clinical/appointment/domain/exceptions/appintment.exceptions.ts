import { DomainException } from '@src/domain/shared/domain.exception';
import { ERROR_CODES } from '@common/constants/error-codes.constant';

export class AppointmentNotFoundException extends DomainException {
  public readonly errorCode = ERROR_CODES.APPOINTMENT.NOT_FOUND;

  constructor(message = 'Randevu bulunamadı.') {
    super(message);
  }
}
