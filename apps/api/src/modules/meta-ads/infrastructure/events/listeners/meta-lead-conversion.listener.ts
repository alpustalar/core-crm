import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { AppointmentCompletedEvent } from '@modules/appointment/domain/events/complete-appointment.event';
import {
  META_LEAD_COMMAND_REPOSITORY,
  META_LEAD_QUERY_REPOSITORY,
  IMetaLeadCommandRepository,
  IMetaLeadQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-lead.repository.interface';

@Injectable()
export class MetaLeadConversionListener {
  private readonly logger = new Logger(MetaLeadConversionListener.name);

  constructor(
    @Inject(META_LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: IMetaLeadQueryRepository,
    @Inject(META_LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: IMetaLeadCommandRepository,
  ) {}

  @OnEvent(AppointmentCompletedEvent.NAME, { async: true })
  async handle(event: AppointmentCompletedEvent): Promise<void> {
    if (!event.patientId) return;

    try {
      const lead = await this.leadQueryRepo.findMatchedLeadByPatientId(
        event.patientId,
      );
      if (!lead) return;

      lead.markConverted(event.appointmentId);
      await this.leadCommandRepo.save(lead);
    } catch (err) {
      this.logger.error(
        `Meta lead dönüşüm hatası — patientId: ${event.patientId}`,
        err,
      );
    }
  }
}
