import { AppointmentStatus, ExternalSystem } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export interface AppointmentProps {
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
}

export class Appointment {
  private readonly props: AppointmentProps;

  constructor(props: AppointmentProps) {
    this.props = props;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get patientName(): string {
    return this.props.patientName;
  }

  get patientPhone(): string {
    return this.props.patientPhone;
  }

  get patientEmail(): string | null {
    return this.props.patientEmail;
  }

  get startTime(): Date {
    return this.props.startTime;
  }

  get endTime(): Date {
    return this.props.endTime;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get treatmentType(): string | null {
    return this.props.treatmentType;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get canceledAt(): Date | null {
    return this.props.canceledAt;
  }

  get canceledBy(): string | null {
    return this.props.canceledBy;
  }

  get cancelReason(): string | null {
    return this.props.cancelReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get externalSystem(): ExternalSystem | null {
    return this.props.externalSystem;
  }

  get externalId(): string | null {
    return this.props.externalId;
  }

  get treatmentId(): string | null {
    return this.props.treatmentId;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get patientId(): string | null {
    return this.props.patientId;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  // Business Logic Methods

  /**
   * Confirms a pending appointment
   * Only PENDING appointments can be confirmed
   */
  public confirm(): void {
    if (this.props.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'Yalnızca bekleyen randevular onaylanabilir.'
      );
    }

    this.props.status = AppointmentStatus.CONFIRMED;
  }

  /**
   * Cancels an appointment
   * Cannot cancel already completed or no-show appointments
   */
  public cancel(canceledBy: string, reason?: string): void {
    if (
      this.props.status === AppointmentStatus.COMPLETED ||
      this.props.status === AppointmentStatus.NOSHOW
    ) {
      throw new BadRequestException(
        'Tamamlanan veya gelmeme olarak işaretlenmiş randevular iptal edilemez.'
      );
    }

    this.props.status = AppointmentStatus.CANCELLED;
    this.props.canceledAt = new Date();
    this.props.canceledBy = canceledBy;
    if (reason) {
      this.props.cancelReason = reason;
    }
  }

  /**
   * Marks appointment as completed
   * Only confirmed or pending appointments can be completed
   */
  public complete(): void {
    if (
      this.props.status !== AppointmentStatus.CONFIRMED &&
      this.props.status !== AppointmentStatus.PENDING
    ) {
      throw new BadRequestException(
        'Yalnızca onaylanan veya bekleyen randevular tamamlanabilir.'
      );
    }

    this.props.status = AppointmentStatus.COMPLETED;
  }

  /**
   * Marks appointment as no-show
   * Patient did not show up for the appointment
   */
  public markAsNoShow(): void {
    if (
      this.props.status !== AppointmentStatus.CONFIRMED &&
      this.props.status !== AppointmentStatus.PENDING
    ) {
      throw new BadRequestException(
        'Yalnızca onaylanan veya bekleyen randevular gelmeme olarak işaretlenebilir.'
      );
    }

    this.props.status = AppointmentStatus.NOSHOW;
  }

  /**
   * Checks if appointment is pending
   */
  public isPending(): boolean {
    return this.props.status === AppointmentStatus.PENDING;
  }

  /**
   * Checks if appointment is confirmed
   */
  public isConfirmed(): boolean {
    return this.props.status === AppointmentStatus.CONFIRMED;
  }

  /**
   * Checks if appointment is cancelled
   */
  public isCancelled(): boolean {
    return this.props.status === AppointmentStatus.CANCELLED;
  }

  /**
   * Checks if appointment is completed
   */
  public isCompleted(): boolean {
    return this.props.status === AppointmentStatus.COMPLETED;
  }

  /**
   * Checks if appointment is no-show
   */
  public isNoShow(): boolean {
    return this.props.status === AppointmentStatus.NOSHOW;
  }

  /**
   * Checks if appointment is in the past
   */
  public isInThePast(): boolean {
    return this.props.endTime < new Date();
  }

  /**
   * Checks if appointment is in the future
   */
  public isInTheFuture(): boolean {
    return this.props.startTime > new Date();
  }

  /**
   * Gets all properties as a plain object
   */
  public toObject(): AppointmentProps {
    return { ...this.props };
  }
}
