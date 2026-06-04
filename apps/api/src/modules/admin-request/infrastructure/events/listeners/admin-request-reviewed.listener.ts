import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandBus } from '@nestjs/cqrs';
import { AdminRequestReviewedEvent } from '@modules/admin-request/domain/events/admin-request-reviewed.event';
import { ADMIN_REQUEST_EVENTS } from '@src/domain/constants/events/admin-request.constants';
import { AdminRequestStatus, AdminRequestType } from '@prisma/client';
import { SoftDeleteClinicCommand } from '@modules/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';

@Injectable()
export class AdminRequestReviewedListener {
  private readonly logger = new Logger(AdminRequestReviewedListener.name);

  constructor(private readonly commandBus: CommandBus) {}

  @OnEvent(ADMIN_REQUEST_EVENTS.REVIEWED, { async: true })
  async handle(event: AdminRequestReviewedEvent) {
    if (event.status !== AdminRequestStatus.APPROVED) return;

    try {
      const ctx = ExecutionContextFactory.createInternal(
        ExecutionSources.INTERNAL_CASCADE
      );

      switch (event.type) {
        case AdminRequestType.CLINIC_DELETION:
          await this.commandBus.execute(
            new SoftDeleteClinicCommand(event.targetId, ctx)
          );
          break;
        case AdminRequestType.ORGANIZATION_DELETION:
          // TODO: SoftDeleteOrganizationCommand dispatch edilecek
          this.logger.warn(
            `ORGANIZATION_DELETION henüz implement edilmedi: targetId=${event.targetId}`
          );
          break;
      }
    } catch (e) {
      // eslint-disable-next-line
      this.logger.error(JSON.stringify(e.message));
    }
  }
}
