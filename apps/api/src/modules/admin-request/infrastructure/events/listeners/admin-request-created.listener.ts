import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdminRequestCreatedEvent } from '@modules/admin-request/domain/events/admin-request-created.event';
import { ADMIN_REQUEST_EVENTS } from '@src/domain/constants/events/admin-request.constants';

@Injectable()
export class AdminRequestCreatedListener {
  private readonly logger = new Logger(AdminRequestCreatedListener.name);

  @OnEvent(ADMIN_REQUEST_EVENTS.CREATED, { async: true })
  async handle(event: AdminRequestCreatedEvent) {
    try {
      this.logger.log(
        `Admin request created: type=${event.type} targetId=${event.targetId} requestedBy=${event.requestedBy}`
      );
      // TODO: admin'e mail/slack bildirimi eklenebilir
    } catch (e) {
      // eslint-disable-next-line
      this.logger.error(JSON.stringify(e.message));
    }
  }
}
