import {
  AppointmentCancellationTimeException,
  InvalidAppointmentCancellationException,
} from '../exceptions/appointment.exceptions';
import { CreateCancellationProps } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export class Cancellation {
  private readonly _canceledAt: Date;
  private readonly _canceledBy: string;
  private readonly _reason: string | null;

  // Constructor'ı dışarıya kapatıyoruz ki sadece static create üzerinden üretilebilsin (Zorunlu değil ama DDD best practice)
  private constructor(props: CreateCancellationProps) {
    this._canceledAt = props.canceledAt;
    this._canceledBy = props.canceledBy;
    this._reason = props.reason ?? null;
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

  public static create(
    canceledAt: Date,
    canceledBy: string,
    reason?: string | null
  ): Cancellation {
    if (!canceledBy || canceledBy.trim() === '') {
      throw new InvalidAppointmentCancellationException();
    }

    const now = new Date();

    if (canceledAt < now) {
      throw new AppointmentCancellationTimeException();
    }

    return new Cancellation({
      canceledAt,
      canceledBy,
      reason,
    });
  }
}
