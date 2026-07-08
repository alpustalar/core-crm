import { Subscription } from './subscription.entity';
import { SubscriptionActivatedEvent } from '@modules/platform/subscription/domain/events';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { randomUUID } from 'crypto';

describe('Subscription entity — polimorfik sahip + yaşam döngüsü', () => {
  const organizationId = randomUUID();
  const clinicId = randomUUID();

  it('ORGANIZATION hedef: clinicId null, org sahibi', () => {
    const sub = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    expect(sub.billingTarget).toBe('ORGANIZATION');
    expect(sub.organizationId.value).toBe(organizationId);
    expect(sub.clinicId).toBeNull();
    expect(sub.toPersistence().clinicId).toBeNull();
  });

  it('CLINIC hedef: clinicId zorunlu ve taşınır', () => {
    const sub = Subscription.create({
      billingTarget: 'CLINIC',
      organizationId,
      clinicId,
    });
    expect(sub.billingTarget).toBe('CLINIC');
    expect(sub.clinicId?.value).toBe(clinicId);
  });

  it('CLINIC hedefte clinicId yoksa hata', () => {
    expect(() =>
      Subscription.create({ billingTarget: 'CLINIC', organizationId })
    ).toThrow(/clinicId/i);
  });

  it('scheduleCancellation → cancelAtPeriodEnd true; undoCancellation geri alır', () => {
    const sub = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    sub.scheduleCancellation();
    expect(sub.cancelAtPeriodEnd).toBe(true);
    sub.undoCancellation();
    expect(sub.cancelAtPeriodEnd).toBe(false);
  });

  it('cancel → CANCELED; ikinci cancel hata verir', () => {
    const sub = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    sub.cancel();
    expect(sub.status).toBe('CANCELED');
    expect(() => sub.cancel()).toThrow();
  });

  it('confirmPayment → ACTIVE + externalId + SubscriptionActivatedEvent', () => {
    const sub = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    sub.failPayment({
      action: LogAction.SUBSCRIPTION_PAYMENT_FAILED,
      type: LogType.WARNING,
      source: LogSource.SYSTEM,
    });
    expect(sub.status).toBe('PAST_DUE');

    sub.confirmPayment('iyz-pay-1', {
      action: LogAction.SUBSCRIPTION_ACTIVATED,
      type: LogType.INFO,
      source: LogSource.SYSTEM,
    });
    expect(sub.status).toBe('ACTIVE');
    expect(sub.externalId).toBe('iyz-pay-1');
    const events = sub.getDomainEvents();
    expect(events.some((e) => e instanceof SubscriptionActivatedEvent)).toBe(
      true
    );
  });

  it('startNewPeriod → yeni dönem + ACTIVE; expire → EXPIRED', () => {
    const sub = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    const start = new Date('2026-07-01T00:00:00Z');
    const end = new Date('2026-08-01T00:00:00Z');
    sub.startNewPeriod(start, end);
    expect(sub.status).toBe('ACTIVE');
    expect(sub.currentPeriodStart).toEqual(start);
    expect(sub.currentPeriodEnd).toEqual(end);

    sub.expire();
    expect(sub.status).toBe('EXPIRED');
  });

  it('linkExternalId → externalId bağlanır', () => {
    const sub = Subscription.create({
      billingTarget: 'ORGANIZATION',
      organizationId,
    });
    sub.linkExternalId('conv-123');
    expect(sub.externalId).toBe('conv-123');
  });
});
