import { GetWaitingRoom } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetWaitingRoomResponse } from './get-waiting-room.response';

/**
 * Kliniğe gelmiş (ARRIVED) ve bekleyen hastaları geliş sırasına göre listeler.
 * clinicId aktör bağlamından gelir; providerId verilirse tek doktora daralır.
 */
export class GetWaitingRoomQuery implements IQuery {
  readonly __responseType!: GetWaitingRoomResponse;

  constructor(
    public readonly filter: GetWaitingRoom,
    public readonly ctx: IGetContext
  ) {}
}
