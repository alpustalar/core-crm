import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReleaseAppointmentSlotCommand } from './release-appointment-slot.command';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';
import { Inject } from '@nestjs/common';
import {
  APPOINTMENT_CACHE_SERVICE,
  IAppointmentCacheService,
} from '@modules/clinical/appointment/domain/interfaces/appointment-cache.service.interface';

/**
 * Slot geçici kilidini serbest bırakır (yalnız kilidi tutan aktör). Kilit yoksa ya da
 * başkasına aitse sessizce geçilir (no-op).
 */
@CommandHandler(ReleaseAppointmentSlotCommand)
export class ReleaseAppointmentSlotHandler
  implements ICommandHandler<ReleaseAppointmentSlotCommand, void>
{
  constructor(
    @Inject(APPOINTMENT_CACHE_SERVICE)
    private readonly cacheService: IAppointmentCacheService
  ) {}

  async execute(command: ReleaseAppointmentSlotCommand): Promise<void> {
    const { data, ctx, holderId } = command.payload;

    const effectiveHolderId = holderId ?? ctx.actor.userId;

    if (!effectiveHolderId) throw new ClinicNotAssignedException();

    await this.cacheService.slotLock.release({
      providerId: data.providerId,
      startTimeIso: data.startTime.toISOString(),
      holderId: effectiveHolderId,
    });
  }
}
