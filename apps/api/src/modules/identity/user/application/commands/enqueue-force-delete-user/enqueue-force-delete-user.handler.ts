import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnqueueForceDeleteUserCommand } from './enqueue-force-delete-user.command';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';

@CommandHandler(EnqueueForceDeleteUserCommand)
export class EnqueueForceDeleteUserHandler
  implements ICommandHandler<EnqueueForceDeleteUserCommand, void>
{
  constructor(
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  async execute(command: EnqueueForceDeleteUserCommand): Promise<void> {
    // Telafi yolu: çağıran zaten bir hata fırlatıyor; event burada, sahibi olan
    // modülün içinde üretilir.
    this.userEventPublisher.enqueueForceDelete(command.payload);
  }
}
