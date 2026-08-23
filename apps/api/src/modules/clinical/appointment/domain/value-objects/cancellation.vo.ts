import { InvalidAppointmentCancellationException } from '../exceptions/appointment.exceptions';

import { DateTimeManager, isEmpty } from '@common/utils';
import { CreateCancellationProps } from '@modules/clinical/appointment/domain/contracts/appointment';

export class Cancellation {
  private readonly _canceledAt: Date;
  private readonly _canceledBy: string;
  private readonly _reason: string | null;

  private constructor(props: {
    canceledAt: Date;
    canceledBy: string;
    reason: string | null | undefined;
  }) {
    this._canceledAt = props.canceledAt;
    this._canceledBy = props.canceledBy;
    this._reason = props.reason ?? null;
    Object.freeze(this);
  }

  get canceledAt(): Date {
    return this._canceledAt;
  }
  get canceledBy(): string {
    return this._canceledBy;
  }
  get reason(): string | null {
    return this._reason;
  }

  public static create(props: CreateCancellationProps) {
    const { canceledBy, reason } = props;

    const now = DateTimeManager.create();

    const instance = !isEmpty(canceledBy)
      ? new Cancellation({ canceledAt: now, canceledBy, reason })
      : undefined;

    return {
      instance,
      orThrow: () => {
        if (!instance) throw new InvalidAppointmentCancellationException();
        return instance;
      },
    };
  }
}
