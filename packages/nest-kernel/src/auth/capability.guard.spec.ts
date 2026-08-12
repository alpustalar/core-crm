import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CapabilityGuard } from './capability.guard';
import { HasCapabilityType } from '@common/decorators/has-capability.decorator';
import { ActorContext } from '@common/interfaces';
import { LogSource } from '@src/domain/constants/log-action.constant';

const makeContext = (actor?: Partial<ActorContext> | null): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ actor }),
    }),
  }) as unknown as ExecutionContext;

const makeActor = (overrides: Partial<ActorContext> = {}): ActorContext => ({
  userId: 'user-1',
  email: 'test@test.com',
  source: LogSource.WEB,
  capabilities: [],
  rolePriority: 0,
  ...overrides,
});

describe('CapabilityGuard', () => {
  let guard: CapabilityGuard;
  let reflector: jest.Mocked<Reflector>;

  // Guard'ın tek bağımlılığı Reflector; DI konteyneri kurmaya gerek yok
  // (kernel paketi @nestjs/testing'e bağımlı değildir).
  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new CapabilityGuard(reflector);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('no @HasCapability decorator on route', () => {
    it('returns true — route is accessible by any authenticated user', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      expect(guard.canActivate(makeContext())).toBe(true);
    });
  });

  describe('super admin bypass (role.priority >= 100)', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValue({
        module: 'clinic',
        action: 'create',
      } as HasCapabilityType);
    });

    it('returns true when role priority is exactly 100', () => {
      const actor = makeActor({ role: { priority: 100 } as any });
      expect(guard.canActivate(makeContext(actor))).toBe(true);
    });

    it('returns true when role priority is above 100', () => {
      const actor = makeActor({ role: { priority: 255 } as any });
      expect(guard.canActivate(makeContext(actor))).toBe(true);
    });

    it('does NOT bypass capability check for priority 99', () => {
      const actor = makeActor({
        role: { priority: 99 } as any,
        capabilities: ['clinic:create'],
      });
      expect(guard.canActivate(makeContext(actor))).toBe(true);
    });
  });

  describe('missing actor or capabilities', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValue({
        module: 'clinic',
        action: 'create',
      } as HasCapabilityType);
    });

    it('throws ForbiddenException when actor is undefined', () => {
      expect(() => guard.canActivate(makeContext(undefined))).toThrow(
        ForbiddenException
      );
    });

    it('throws ForbiddenException when actor has no capabilities array', () => {
      const actor = { ...makeActor(), capabilities: undefined } as any;
      expect(() => guard.canActivate(makeContext(actor))).toThrow(
        ForbiddenException
      );
    });
  });

  describe('capability matching', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValue({
        module: 'CLINIC',
        action: 'CREATE',
      } as HasCapabilityType);
    });

    it('returns true when actor has the required capability', () => {
      const actor = makeActor({ capabilities: ['clinic:create'] });
      expect(guard.canActivate(makeContext(actor))).toBe(true);
    });

    it('module and action are lowercased before comparison', () => {
      const actor = makeActor({ capabilities: ['clinic:create'] });
      expect(guard.canActivate(makeContext(actor))).toBe(true);
    });

    it('throws ForbiddenException when no capability matches', () => {
      const actor = makeActor({ capabilities: ['clinic:read', 'user:create'] });
      expect(() => guard.canActivate(makeContext(actor))).toThrow(
        ForbiddenException
      );
    });

    it('throws ForbiddenException with the required permission key in the message', () => {
      const actor = makeActor({ capabilities: [] });
      expect(() => guard.canActivate(makeContext(actor))).toThrow(
        `'clinic:create' yetkisine`
      );
    });

    it('returns true when capabilities list has multiple entries and one matches', () => {
      const actor = makeActor({
        capabilities: ['user:read', 'clinic:create', 'invoice:read'],
      });
      expect(guard.canActivate(makeContext(actor))).toBe(true);
    });

    it('throws when actor has empty capabilities array', () => {
      const actor = makeActor({ capabilities: [] });
      expect(() => guard.canActivate(makeContext(actor))).toThrow(
        ForbiddenException
      );
    });
  });

  /**
   * Yetki eşleşmesi tam eşitlikle yapılır. Model adı başka bir model adıyla
   * bitiyorsa (bankaccount/account, metalead/lead, purchaseinvoice/invoice…)
   * substring eşleşmesi dar yetkiyi geniş yetkiye terfi ettirirdi.
   */
  describe('substring yetki sızıntısı (regresyon)', () => {
    const cases: Array<[string, string, string]> = [
      ['account', 'read', 'bankaccount:read'],
      ['lead', 'read', 'metalead:read'],
      ['invoice', 'read', 'purchaseinvoice:read'],
      ['payment', 'read', 'bookingpayment:read'],
      ['treatment', 'read', 'mastertreatment:read'],
      ['provider', 'read', 'treatmentpackageprovider:read'],
      ['module', 'read', 'planmodule:read'],
    ];

    it.each(cases)(
      '%s:%s istenirken aktörde yalnız %s varsa reddeder',
      (module, action, ownedCapability) => {
        reflector.getAllAndOverride.mockReturnValue({
          module,
          action,
        } as HasCapabilityType);

        const actor = makeActor({ capabilities: [ownedCapability] });

        expect(() => guard.canActivate(makeContext(actor))).toThrow(
          ForbiddenException
        );
      }
    );

    it('dar yetkinin kendi rotasına erişimi bozulmaz', () => {
      reflector.getAllAndOverride.mockReturnValue({
        module: 'bankaccount',
        action: 'read',
      } as HasCapabilityType);

      const actor = makeActor({ capabilities: ['bankaccount:read'] });

      expect(guard.canActivate(makeContext(actor))).toBe(true);
    });
  });
});
