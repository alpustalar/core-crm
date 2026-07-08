import { ClinicAppointmentSettings as IClinicAppointmentSettings } from '@shared';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';
import { CreateClinicAppointmentSettingsProps } from '@modules/organization/clinic/domain/contracts/clinic-appointment-settings.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { shouldValidate } from '@common/domain/utils/should-validate';

interface AppointmentSettingsInvariants {
  rescheduleLimitHours: number;
  cancelLimitHours: number;
  sendSmsReminderHours: number;
  maxActivePatientBookings: number;
  maxFutureBookingDays: number;
}

/**
 * Kliniğin randevu davranış ayarları (1:1 satellite). Hastanın panelden kendi
 * randevusunu iptal/erteleme sınırları (saat), sekreter onay zorunluluğu ve en
 * ileri randevu tarihini taşır. Satır yoksa {@link ClinicAppointmentSettings.createDefault}
 * ile DB default'ları geçerlidir.
 */
export class ClinicAppointmentSettings {
  constructor(data: IClinicAppointmentSettings) {
    this._id = UUID.fromTrusted(data.id);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._rescheduleLimitHours = data.rescheduleLimitHours;
    this._cancelLimitHours = data.cancelLimitHours;
    this._allowPatientCancel = data.allowPatientCancel;
    this._staffAllowOverbooking = data.staffAllowOverbooking;
    this._sendSmsReminderHours = data.sendSmsReminderHours;
    this._maxActivePatientBookings = data.maxActivePatientBookings;
    this._requireReminderResponse = data.requireReminderResponse;
    this._requireConfirmation = data.requireConfirmation;
    this._maxFutureBookingDays = data.maxFutureBookingDays;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  /** Girişlerin iş kuralı barikatı — create sırasında koşulur. */
  private static get businessRulesValidator() {
    return {
      create: (input: AppointmentSettingsInvariants) => {
        const nonNegativeInvalid =
          input.rescheduleLimitHours < 0 ||
          input.cancelLimitHours < 0 ||
          input.sendSmsReminderHours < 0;
        const bookingsInvalid = input.maxActivePatientBookings < 1;
        const futureDaysInvalid = input.maxFutureBookingDays < 1;
        const isInvalid =
          nonNegativeInvalid || bookingsInvalid || futureDaysInvalid;

        return {
          isValid: !isInvalid,
          orThrow: () => {
            if (nonNegativeInvalid) {
              throw new Error('Saat sınırları negatif olamaz.');
            }
            if (bookingsInvalid) {
              throw new Error('Aktif randevu limiti en az 1 olmalı.');
            }
            if (futureDaysInvalid) {
              throw new Error('İleri randevu gün sınırı en az 1 olmalı.');
            }
          },
        };
      },
    };
  }

  private _id: UUID;

  get id(): UUID {
    return this._id;
  }

  private _clinicId: UUID;

  get clinicId(): UUID {
    return this._clinicId;
  }

  private _rescheduleLimitHours: number;

  /** Randevuya bu kadar saatten az kaldıysa hasta panelden erteleyemez. */
  get rescheduleLimitHours(): number {
    return this._rescheduleLimitHours;
  }

  private _cancelLimitHours: number;

  /** Randevuya bu kadar saatten az kaldıysa hasta panelden iptal edemez. */
  get cancelLimitHours(): number {
    return this._cancelLimitHours;
  }

  private _allowPatientCancel: boolean;

  /** Hasta kendi randevusunu panelden iptal edebilir mi? */
  get allowPatientCancel(): boolean {
    return this._allowPatientCancel;
  }

  private _staffAllowOverbooking: boolean;

  /** Personel aynı hekime/koltuğa çift randevu (overbooking) yazabilsin mi? */
  get staffAllowOverbooking(): boolean {
    return this._staffAllowOverbooking;
  }

  private _sendSmsReminderHours: number;

  /** Randevuya kaç saat kala hatırlatma gönderilsin? */
  get sendSmsReminderHours(): number {
    return this._sendSmsReminderHours;
  }

  private _maxActivePatientBookings: number;

  /** Bir hastanın aynı anda gelecekte sahip olabileceği maksimum randevu sayısı. */
  get maxActivePatientBookings(): number {
    return this._maxActivePatientBookings;
  }

  private _requireReminderResponse: boolean;

  /** Hastadan hatırlatmaya "geleceğim/gelmeyeceğim" onayı zorunlu kılınsın mı? */
  get requireReminderResponse(): boolean {
    return this._requireReminderResponse;
  }

  private _requireConfirmation: boolean;

  /** Randevu alındığında sekreter onayı gereksin mi? */
  get requireConfirmation(): boolean {
    return this._requireConfirmation;
  }

  private _maxFutureBookingDays: number;

  /** En fazla kaç gün sonrasına randevu açılabilir? */
  get maxFutureBookingDays(): number {
    return this._maxFutureBookingDays;
  }

  private _createdAt: Date;

  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Durum sorguları (Guard tabanlı). */
  public get validate() {
    return {
      confirmation: {
        isRequired: Guard.monitor(
          this.requireConfirmation,
          this.requireConfirmation,
          () => new Error('Sekreter onayı zorunlu değil.')
        ),
      },
      patientCancel: {
        isAllowed: Guard.monitor(
          this.allowPatientCancel,
          this.allowPatientCancel,
          () => new Error('Hasta panelden iptal edemez.')
        ),
      },
      reminderResponse: {
        isRequired: Guard.monitor(
          this.requireReminderResponse,
          this.requireReminderResponse,
          () => new Error('Hatırlatma yanıtı zorunlu değil.')
        ),
      },
    };
  }

  /** Klinik için varsayılan randevu ayarları. */
  public static createDefault(clinicId: string): ClinicAppointmentSettings {
    return ClinicAppointmentSettings.create({ clinicId });
  }

  public static create(
    props: CreateClinicAppointmentSettingsProps,
    validateOptions = DefaultValidateOptions
  ): ClinicAppointmentSettings {
    const rescheduleLimitHours = props.rescheduleLimitHours ?? 6;
    const cancelLimitHours = props.cancelLimitHours ?? 24;
    const sendSmsReminderHours = props.sendSmsReminderHours ?? 24;
    const maxActivePatientBookings = props.maxActivePatientBookings ?? 3;
    const maxFutureBookingDays = props.maxFutureBookingDays ?? 90;

    if (shouldValidate(validateOptions))
      ClinicAppointmentSettings.businessRulesValidator
        .create({
          rescheduleLimitHours,
          cancelLimitHours,
          sendSmsReminderHours,
          maxActivePatientBookings,
          maxFutureBookingDays,
        })
        .orThrow();

    const settingsId = props.id
      ? UUID.create(props.id).orThrow()
      : UUID.generate();

    const now = DateTimeManager.create();
    return new ClinicAppointmentSettings({
      id: settingsId.value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      rescheduleLimitHours,
      cancelLimitHours,
      allowPatientCancel: props.allowPatientCancel ?? true,
      staffAllowOverbooking: props.staffAllowOverbooking ?? true,
      sendSmsReminderHours,
      maxActivePatientBookings,
      requireReminderResponse: props.requireReminderResponse ?? false,
      requireConfirmation: props.requireConfirmation ?? false,
      maxFutureBookingDays,
      createdAt: now,
      updatedAt: now,
    });
  }

  toPersistence(): IClinicAppointmentSettings {
    return {
      id: this.id.value,
      clinicId: this.clinicId.value,
      rescheduleLimitHours: this.rescheduleLimitHours,
      cancelLimitHours: this.cancelLimitHours,
      allowPatientCancel: this.allowPatientCancel,
      staffAllowOverbooking: this.staffAllowOverbooking,
      sendSmsReminderHours: this.sendSmsReminderHours,
      maxActivePatientBookings: this.maxActivePatientBookings,
      requireReminderResponse: this.requireReminderResponse,
      requireConfirmation: this.requireConfirmation,
      maxFutureBookingDays: this.maxFutureBookingDays,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
