import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReleaseAppointmentSlotCommand } from './release-appointment-slot.command';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';
import { AppointmentCacheService } from '@modules/clinical/appointment/infrastructure/cache/appointment-cache.service';

/**
 * Slot geçici kilidini serbest bırakır (yalnız kilidi tutan aktör). Kilit yoksa ya da
 * başkasına aitse sessizce geçilir (no-op).
 */
@CommandHandler(ReleaseAppointmentSlotCommand)
export class ReleaseAppointmentSlotHandler
  implements ICommandHandler<ReleaseAppointmentSlotCommand, void>
{
  constructor(private readonly cacheService: AppointmentCacheService) {}

  async execute(command: ReleaseAppointmentSlotCommand): Promise<void> {
    const { data, ctx, holderId } = command.payload;
    const { actor } = ctx;

    const effectiveHolderId = holderId ?? actor.userId;
    if (!effectiveHolderId) throw new ClinicNotAssignedException();

    await this.cacheService.slotLock.release({
      providerId: data.providerId,
      startTimeIso: data.startTime.toISOString(),
      holderId: effectiveHolderId,
    });
  }
}
