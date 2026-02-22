import { EventEmitter2 } from '@nestjs/event-emitter';
import { CLINIC_EVENTS } from '../../../../common/constants';
import { ClinicSoftDeletedEvent } from '../../../../common/events/clinic/clinic-soft-deleted.event';
import { ClinicCreatedEvent } from '../../../../common/events/clinic';

export class ClinicEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async deleteClinic(event: ClinicSoftDeletedEvent) {
    await this.eventEmitter.emitAsync(
      CLINIC_EVENTS.SOFT_DELETED,
      new ClinicSoftDeletedEvent(event),
    );
  }

  async createClinic(event: ClinicCreatedEvent) {
    await this.eventEmitter.emitAsync(
      CLINIC_EVENTS.CREATED,
      new ClinicCreatedEvent(event),
    );
  }
}
