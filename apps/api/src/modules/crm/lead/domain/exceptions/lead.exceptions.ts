import { ERROR_CODES } from '@common/constants/error-codes.constant';
import { DomainException } from '@src/domain/exceptions/domain.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidLeadStatusTransitionException extends DomainException<{
  requiredStatus: string;
  currentStatus?: string;
}> {
  readonly errorCode = ERROR_CODES.LEAD.INVALID_STATUS_TRANSITION;
  public override readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(required: string, current?: string) {
    super(`Yalnızca ${required} statüsündeki leadler bu işleme uygun.`, {
      requiredStatus: required,
      currentStatus: current,
    });
  }
}

export class LeadAlreadyFinalizedException extends DomainException<{
  leadId?: string;
}> {
  readonly errorCode = ERROR_CODES.LEAD.ALREADY_FINALIZED;
  public override readonly httpStatus = HttpStatus.CONFLICT;

  constructor(leadId?: string) {
    super('Bu lead zaten dönüştürülmüş veya kaybedilmiş.', { leadId });
  }
}

export class LeadNotFoundException extends DomainException<{ leadId: string }> {
  readonly errorCode = ERROR_CODES.LEAD.NOT_FOUND;
  public override readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(leadId?: string) {
    super('Lead bulunamadı.', { leadId });
  }
}
