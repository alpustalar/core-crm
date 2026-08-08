import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkNotificationReadCommand } from './mark-notification-read.command';
import {
  IStaffNotificationCommandRepository,
  STAFF_NOTIFICATION_COMMAND_REPOSITORY,
} from '@modules/platform/notification/domain/repositories/staff-notification.repository';
import { NotificationNotFoundException } from '@modules/platform/notification/domain/exceptions/notification.exceptions';

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler implements ICommandHandler<
  MarkNotificationReadCommand,
  void
> {
  constructor(
    @Inject(STAFF_NOTIFICATION_COMMAND_REPOSITORY)
    private readonly staffNotificationCommandRepo: IStaffNotificationCommandRepository
  ) {}

  async execute(command: MarkNotificationReadCommand): Promise<void> {
    const notification = await this.staffNotificationCommandRepo.findById(
      command.notificationId
    );

    // Bulunamadı veya başkasının bildirimi → sızıntıyı önlemek için ikisi de NOT_FOUND.
    if (
      !notification ||
      notification.staffId.value !== command.ctx.actor.userId
    ) {
      throw new NotificationNotFoundException();
    }

    notification.markAsRead();
    await this.staffNotificationCommandRepo.update(notification);
  }
}
