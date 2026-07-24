import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkAllNotificationsReadCommand } from './mark-all-notifications-read.command';
import {
  IStaffNotificationCommandRepository,
  STAFF_NOTIFICATION_COMMAND_REPOSITORY,
} from '@modules/platform/notification/domain/repositories/staff-notification.repository';

@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadHandler
  implements ICommandHandler<MarkAllNotificationsReadCommand, void>
{
  constructor(
    @Inject(STAFF_NOTIFICATION_COMMAND_REPOSITORY)
    private readonly staffNotificationCommandRepo: IStaffNotificationCommandRepository
  ) {}

  async execute(command: MarkAllNotificationsReadCommand): Promise<void> {
    await this.staffNotificationCommandRepo.markAllRead(
      command.ctx.actor.userId
    );
  }
}
