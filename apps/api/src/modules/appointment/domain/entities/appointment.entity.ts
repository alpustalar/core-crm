import { AppointmentStatus, ExternalSystem } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export class Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  startTime: Date;
  endTime: Date;
  timezone: string;
  treatmentType: string | null;
  notes: string | null;
  status: AppointmentStatus;
  canceledAt: Date | null;
  canceledBy: string | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  externalSystem: ExternalSystem | null;
  externalId: string | null;
  treatmentId: string | null;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;

  constructor({
    id,
    patientName,
    patientPhone,
    patientEmail,
    startTime,
    endTime,
    timezone,
    treatmentType,
    notes,
    status,
    canceledAt,
    canceledBy,
    cancelReason,
    createdAt,
    updatedAt,
    externalSystem,
    externalId,
    treatmentId,
    clinicId,
    providerId,
    patientId,
    isDeleted,
    deletedAt,
  }: {
    id: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string | null;
    startTime: Date;
    endTime: Date;
    timezone: string;
    treatmentType: string | null;
    notes: string | null;
    status: AppointmentStatus;
    canceledAt: Date | null;
    canceledBy: string | null;
    cancelReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    externalSystem: ExternalSystem | null;
    externalId: string | null;
    treatmentId: string | null;
    clinicId: string;
    providerId: string;
    patientId: string | null;
    isDeleted: boolean;
    deletedAt: Date | null;
  }) {
    this.id = id;
    this.patientName = patientName;
    this.patientPhone = patientPhone;
    this.patientEmail = patientEmail;
    this.startTime = startTime;
    this.endTime = endTime;
    this.timezone = timezone;
    this.treatmentType = treatmentType;
    this.notes = notes;
    this.status = status;
    this.canceledAt = canceledAt;
    this.canceledBy = canceledBy;
    this.cancelReason = cancelReason;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.externalSystem = externalSystem;
    this.externalId = externalId;
    this.treatmentId = treatmentId;
    this.clinicId = clinicId;
    this.providerId = providerId;
    this.patientId = patientId;
    this.isDeleted = isDeleted;
    this.deletedAt = deletedAt;
  }

  /**
   * Confirms a pending appointment
   * Only PENDING appointments can be confirmed
   */
  public confirm(): void {
    if (this.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'Yalnızca bekleyen randevular onaylanabilir.'
      );
    }

    this.status = AppointmentStatus.CONFIRMED;
  }

  /**
   * Cancels an appointment
   * Cannot cancel already completed or no-show appointments
   */
  public cancel(canceledBy: string, reason?: string): void {
    if (
      this.status === AppointmentStatus.COMPLETED ||
      this.status === AppointmentStatus.NOSHOW
    ) {
      throw new BadRequestException(
        'Tamamlanan veya gelmeme olarak işaretlenmiş randevular iptal edilemez.'
      );
    }

    this.status = AppointmentStatus.CANCELLED;
    this.canceledAt = new Date();
    this.canceledBy = canceledBy;
    if (reason) {
      this.cancelReason = reason;
    }
  }

  /**
   * Marks appointment as completed
   * Only confirmed or pending appointments can be completed
   */
  public complete(): void {
    if (
      this.status !== AppointmentStatus.CONFIRMED &&
      this.status !== AppointmentStatus.PENDING
    ) {
      throw new BadRequestException(
        'Yalnızca onaylanan veya bekleyen randevular tamamlanabilir.'
      );
    }

    this.status = AppointmentStatus.COMPLETED;
  }

  /**
   * Marks appointment as no-show
   * Patient did not show up for the appointment
   */
  public markAsNoShow(): void {
    if (
      this.status !== AppointmentStatus.CONFIRMED &&
      this.status !== AppointmentStatus.PENDING
    ) {
      throw new BadRequestException(
        'Yalnızca onaylanan veya bekleyen randevular gelmeme olarak işaretlenebilir.'
      );
    }

    this.status = AppointmentStatus.NOSHOW;
  }

  /**
   * Checks if appointment is pending
   */
  public isPending(): boolean {
    return this.status === AppointmentStatus.PENDING;
  }

  /**
   * Checks if appointment is confirmed
   */
  public isConfirmed(): boolean {
    return this.status === AppointmentStatus.CONFIRMED;
  }

  /**
   * Checks if appointment is cancelled
   */
  public isCancelled(): boolean {
    return this.status === AppointmentStatus.CANCELLED;
  }

  /**
   * Checks if appointment is completed
   */
  public isCompleted(): boolean {
    return this.status === AppointmentStatus.COMPLETED;
  }

  /**
   * Checks if appointment is no-show
   */
  public isNoShow(): boolean {
    return this.status === AppointmentStatus.NOSHOW;
  }

  /**
   * Checks if appointment is in the past
   */
  public isInThePast(): boolean {
    return this.endTime < new Date();
  }

  /**
   * Checks if appointment is in the future
   */
  public isInTheFuture(): boolean {
    return this.startTime > new Date();
  }
}
