import { BaseRules } from '@common/domain/rules/base.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import { LeaveNotPendingException } from '@modules/hr/leave/domain/exceptions/leave.exceptions';

export class LeaveRequestRules extends BaseRules {
  constructor(
    private readonly leaveReq: LeaveRequest,
    public readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  approve() {
    const isValid = !this.leaveReq.validate.status.isPending().value;
    return this.evaluate(
      isValid,
      () => new Error('Başvuru zaten sonuçlandırılmış'),
      this.validateOptions
    );
  }

  reject() {
    const isValid = !this.leaveReq.validate.status.isPending().value;
    return this.evaluate(
      isValid,
      () => new Error('Başvuru zaten sonuçlandırılmış'),
      this.validateOptions
    );
  }

  cancel() {
    const isInvalid =
      this.leaveReq.validate.status.isRejected().value ||
      this.leaveReq.validate.status.isCancelled();
    return this.evaluate(
      !isInvalid,
      () => new LeaveNotPendingException(this.leaveReq.status),
      this.validateOptions
    );
  }
}
