import { Validate } from '@common/interfaces';
import {
  AppointmentCancellationNotAllowedException,
  AppointmentCannotCompleteException,
  AppointmentCheckInNotAllowedException,
  AppointmentInvalidNoShowStatusException,
  AppointmentOnlyPendingCanBeConfirmedException,
  AppointmentRescheduleNotAllowedException,
} from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { AppointmentStatusSchema } from '@shared';
import { BaseRules } from '@common/domain/rules/base.rules';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { IAppointmentRules } from '@modules/clinical/appointment/domain/interfaces/appointment.rules.interface';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';
import { CreateAppointmentProps } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export class AppointmentRules extends BaseRules implements IAppointmentRules {
  constructor(
    private readonly appointment: Appointment,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  public get markAsNoShow(): Validate {
    const isInvalid =
      !this.appointment.validate.status.isPending().value &&
      !this.appointment.validate.status.isConfirmed().value;

    return this.evaluate(
      !isInvalid,
      () =>
        new AppointmentInvalidNoShowStatusException(
          this.appointment.id.value,
          this.appointment.status
        ),
      this.validateOptions
    );
  }

  public get checkIn(): Validate {
    const isInvalid =
      !this.appointment.validate.status.isPending().value &&
      !this.appointment.validate.status.isConfirmed().value;

    return this.evaluate(
      !isInvalid,
      () => new AppointmentCheckInNotAllowedException(this.appointment.status),
      this.validateOptions
    );
  }

  public get complete(): Validate {
    const isInvalid =
      this.appointment.validate.status.isCancelled().value ||
      this.appointment.validate.status.isCompleted().value ||
      this.appointment.validate.status.isNoShow().value;

    return this.evaluate(
      !isInvalid,
      () =>
        new AppointmentCannotCompleteException(
          this.appointment.id.value,
          this.appointment.status
        ),
      this.validateOptions
    );
  }

  public get confirm(): Validate {
    const isInvalid = !this.appointment.validate.status.isPending().value;

    return this.evaluate(
      !isInvalid,
      () =>
        new AppointmentOnlyPendingCanBeConfirmedException(
          this.appointment.id.value,
          this.appointment.status
        ),
      this.validateOptions
    );
  }

  public get canBeCancelled(): Validate {
    const invalidStatuses: AppointmentStatusType[] = [
      AppointmentStatusSchema.enum.CANCELLED,
      AppointmentStatusSchema.enum.COMPLETED,
      AppointmentStatusSchema.enum.NOSHOW,
    ];
    const isValid = !invalidStatuses.includes(this.appointment.status);

    return this.evaluate(
      isValid,
      () => new AppointmentCancellationNotAllowedException(),
      this.validateOptions
    );
  }

  public get canBeScheduled(): Validate {
    const invalidStatuses: AppointmentStatusType[] = [
      AppointmentStatusSchema.enum.CANCELLED,
      AppointmentStatusSchema.enum.COMPLETED,
      AppointmentStatusSchema.enum.NOSHOW,
    ];
    const isValid = !invalidStatuses.includes(this.appointment.status);

    return this.evaluate(
      isValid,
      () =>
        new AppointmentRescheduleNotAllowedException(
          this.appointment.id.value,
          this.appointment.status
        ),
      this.validateOptions
    );
  }

  public schedule(props: Pick<CreateAppointmentProps, 'startTime'>) {
    const { isValid, error } = this.create(props);
    return this.evaluate(isValid, () => error, this.validateOptions);
  }

  public reschedule(startTime: Date, endTime: Date): Validate {
    const now = DateTimeManager.create();
    const isInvalid =
      DateTimeManager.isBefore(startTime, now) ||
      DateTimeManager.isBeforeOrEqual(startTime, endTime);

    return this.evaluate(
      !isInvalid,
      () => new Error('Geçersiz başlangıç zamanı'),
      this.validateOptions
    );
  }

  private create(props: Pick<CreateAppointmentProps, 'startTime'>) {
    const now = DateTimeManager.create();
    const isInvalid = DateTimeManager.isBefore(props.startTime, now);

    return {
      isValid: !isInvalid,
      error: new Error('Randevu başlangıç tarihi geçmişte olamaz'),
    };
  }
}
