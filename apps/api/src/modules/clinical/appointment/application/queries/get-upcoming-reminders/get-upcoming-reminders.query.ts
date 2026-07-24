import { GetUpcomingReminders } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetUpcomingRemindersQueryResponse } from './get-upcoming-reminders.response';

/**
 * Resepsiyon hatırlatma listesi: aktörün kliniğinde, şu andan hoursAhead saat
 * içindeki onaylı yaklaşan randevular (sayfalı). clinicId aktör bağlamından alınır.
 */
export class GetUpcomingRemindersQuery implements IQuery {
  readonly __responseType!: GetUpcomingRemindersQueryResponse;

  constructor(
    public readonly filter: GetUpcomingReminders,
    public readonly ctx: IGetContext
  ) {}
}
