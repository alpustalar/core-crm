import { Appointment, AppointmentStatus, ExternalSystem } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export class AppointmentEntity implements Appointment {
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

  constructor(data: Appointment) {
    Object.assign(this, data);
  }

  public confirm(): void {
    if (this.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(
        'Yalnızca bekleyen randevular onaylanabilir.'
      );
    }

    this.status = AppointmentStatus.CONFIRMED;
  }

  public cancel(canceledBy: string, reason?: string): void {
    if (
      this.status === AppointmentStatus.COMPLETED ||
      this.status === AppointmentStatus.CANCELLED ||
      this.status === AppointmentStatus.NOSHOW
    ) {
      throw new BadRequestException(
        'Tamamlanan, iptal edilmiş veya randevuya gelmedi olarak işaretlenmiş randevular iptal edilemez.'
      );
    }

    this.status = AppointmentStatus.CANCELLED;
    this.canceledAt = new Date();
    this.canceledBy = canceledBy;
    if (reason) {
      this.cancelReason = reason;
    }
  }

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

  public isPending(): boolean {
    return this.status === AppointmentStatus.PENDING;
  }

  public isConfirmed(): boolean {
    return this.status === AppointmentStatus.CONFIRMED;
  }

  public isCancelled(): boolean {
    return this.status === AppointmentStatus.CANCELLED;
  }

  public isCompleted(): boolean {
    return this.status === AppointmentStatus.COMPLETED;
  }

  public isNoShow(): boolean {
    return this.status === AppointmentStatus.NOSHOW;
  }

  public isInThePast(): boolean {
    return this.endTime < new Date();
  }

  public isInTheFuture(): boolean {
    return this.startTime > new Date();
  }
}
