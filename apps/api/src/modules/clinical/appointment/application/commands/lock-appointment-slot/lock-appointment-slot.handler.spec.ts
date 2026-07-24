import { LockAppointmentSlotHandler } from './lock-appointment-slot.handler';
import { LockAppointmentSlotCommand } from './lock-appointment-slot.command';
import { SlotTemporarilyHeldException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';

/**
 * Slot geçici kilit handler'ı. Kilit alınırsa lockedUntil/ttl döner; başka biri
 * tutuyorsa SlotTemporarilyHeldException; aktör yoksa ClinicNotAssigned.
 */
describe('LockAppointmentSlotHandler (slot geçici kilit)', () => {
  const dto = {
    providerId: '33333333-3333-4333-8333-333333333333',
    startTime: new Date('2026-05-03T09:00:00Z'),
  };

  const build = (acquired: boolean, actor: Record<string, unknown> = { userId: 'user-1' }) => {
    const acquireSlotLock = jest.fn(() => Promise.resolve(acquired));
    const redis = { acquireSlotLock, slotLockTtlSeconds: 120 } as never;
    const ctx = { actor } as never;
    return {
      handler: new LockAppointmentSlotHandler(redis),
      ctx,
      acquireSlotLock,
    };
  };

  it('kilit alınırsa ttl + lockedUntil döner ve holder=userId ile kilitler', async () => {
    const { handler, ctx, acquireSlotLock } = build(true);

    const res = await handler.execute(new LockAppointmentSlotCommand(dto as never, ctx));

    expect(acquireSlotLock).toHaveBeenCalledWith(
      dto.providerId,
      dto.startTime.toISOString(),
      'user-1'
    );
    expect(res.ttlSeconds).toBe(120);
    expect(res.lockedUntil).toBeInstanceOf(Date);
  });

  it('slot başkası tarafından tutuluyorsa SlotTemporarilyHeldException fırlatır', async () => {
    const { handler, ctx } = build(false);
    await expect(
      handler.execute(new LockAppointmentSlotCommand(dto as never, ctx))
    ).rejects.toBeInstanceOf(SlotTemporarilyHeldException);
  });

  it('aktör yoksa ClinicNotAssignedException fırlatır', async () => {
    const { handler, ctx } = build(true, {});
    await expect(
      handler.execute(new LockAppointmentSlotCommand(dto as never, ctx))
    ).rejects.toBeInstanceOf(ClinicNotAssignedException);
  });
});
