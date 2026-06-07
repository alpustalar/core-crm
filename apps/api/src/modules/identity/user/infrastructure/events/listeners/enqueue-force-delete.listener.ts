import { USER_EVENTS } from '@src/domain/constants/events';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EnqueueForceDeleteEvent } from '@modules/identity/user/domain/events/enqueue-force-delete.event';
import { UserProducer } from '@modules/identity/user/infrastructure/queue/producer/user.producer';

@Injectable()
export class EnqueueForceDeleteListener {
  private readonly logger = new Logger(EnqueueForceDeleteListener.name);

  constructor(private readonly userProducer: UserProducer) {}

  @OnEvent(USER_EVENTS.ENQUEUE_FORCE_DELETE, { async: true })
  async handle(event: EnqueueForceDeleteEvent) {
    const { log, firebaseUid } = event;

    try {
      this.logger.log(log, firebaseUid);
      await this.userProducer.compensateFirebaseRollback({ firebaseUid });
    } catch (e) {
      this.logger.error(
        `FATAL: Failed to enqueue Firebase cleanup for ${firebaseUid}. 
        Manual intervention required!: ${JSON.stringify(e)}`
      );
    }
  }
}
