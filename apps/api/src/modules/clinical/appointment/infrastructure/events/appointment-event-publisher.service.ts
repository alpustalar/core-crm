import { Inject, Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/context/context.service';
import {
  CancelAppointmentEvent,
  CancelAppointmentPayload,
} from '@modules/clinical/appointment/domain/events/cancel-appointment.event';
import { IAppointmentEventPublisher } from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';
import { CONTEXT_SERVICE } from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class AppointmentEventPublisher implements IAppointmentEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: ContextService
  ) {}

  cancelAppointment(payload: CancelAppointmentPayload) {
    this.contextService.addEvent(new CancelAppointmentEvent(payload));
  }
}
