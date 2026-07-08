import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleEntitlementGuard } from './module-entitlement.guard';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { SubscriptionModuleRequiredException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';
import { TenantEntitlements } from '@common/interfaces';
import { randomUUID } from 'crypto';

describe('ModuleEntitlementGuard', () => {
  const organizationId = randomUUID();

  const ctxFor = (actor: unknown): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ actor }) }),
    }) as unknown as ExecutionContext;

  const build = (opts: {
    requiredModule?: string;
    cached?: TenantEntitlements | null;
    queried?: TenantEntitlements;
  }) => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(opts.requiredModule),
    } as unknown as Reflector;

    const setTenantEntitlements = jest.fn();
    const redis = {
      getTenantEntitlements: jest
        .fn()
        .mockResolvedValue(opts.cached ?? null),
      setTenantEntitlements,
    } as unknown as RedisService;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: opts.queried }),
    } as unknown as TSQueryBus;

    const guard = new ModuleEntitlementGuard(reflector, queryBus, redis);
    return { guard, queryBus, setTenantEntitlements };
  };

  const active = (modules: string[]): TenantEntitlements => ({
    modules,
    planId: 'BASIC',
    status: 'ACTIVE',
    active: true,
    trialEndsAt: null,
  });

  it('@RequiresModule yoksa → serbest geçer', async () => {
    const t = build({ requiredModule: undefined });
    await expect(t.guard.canActivate(ctxFor({ organizationId }))).resolves.toBe(
      true
    );
  });

  it('sistem admin (priority>=100) → modül aranmadan geçer', async () => {
    const t = build({ requiredModule: 'e_invoice' });
    const actor = { organizationId, role: { priority: 100 } };
    await expect(t.guard.canActivate(ctxFor(actor))).resolves.toBe(true);
    expect(t.queryBus.execute).not.toHaveBeenCalled();
  });

  it('cache hit + modül mevcut → geçer, query çağrılmaz', async () => {
    const t = build({
      requiredModule: 'e_invoice',
      cached: active(['e_invoice']),
    });
    await expect(
      t.guard.canActivate(ctxFor({ organizationId }))
    ).resolves.toBe(true);
    expect(t.queryBus.execute).not.toHaveBeenCalled();
  });

  it('cache miss → query çözer + cache yazar; modül yoksa 402 fırlatır', async () => {
    const t = build({
      requiredModule: 'e_invoice',
      cached: null,
      queried: active(['crm']),
    });
    await expect(
      t.guard.canActivate(ctxFor({ organizationId }))
    ).rejects.toBeInstanceOf(SubscriptionModuleRequiredException);
    expect(t.setTenantEntitlements).toHaveBeenCalled();
  });

  it('abonelik pasif (active:false) → 402', async () => {
    const t = build({
      requiredModule: 'e_invoice',
      cached: { ...active(['e_invoice']), active: false },
    });
    await expect(
      t.guard.canActivate(ctxFor({ organizationId }))
    ).rejects.toBeInstanceOf(SubscriptionModuleRequiredException);
  });

  it('organizationId yoksa → 402', async () => {
    const t = build({ requiredModule: 'e_invoice' });
    await expect(t.guard.canActivate(ctxFor({}))).rejects.toBeInstanceOf(
      SubscriptionModuleRequiredException
    );
  });
});
