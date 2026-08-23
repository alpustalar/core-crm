import { DbActorContextResolver } from './db-actor-context.resolver';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { VerifiedToken } from '@src/auth';

/**
 * `ActorContext.organizationId` kiracı kimliğidir: kayıtların hangi kiracıya
 * yazılacağını ve org-kapsamlı listelerin neyi döndüreceğini belirler. Bu yüzden
 * **tahmin edilemez** — belirsizse boş bırakılır ve kapsam istekten beklenir.
 */
describe('DbActorContextResolver — organizationId çözümlemesi', () => {
  const token = { uid: 'user-1', email: 'staff@clinic.com' } as VerifiedToken;

  const buildUser = (overrides: Record<string, unknown>) => ({
    id: 'user-1',
    email: 'staff@clinic.com',
    roleId: 'role-1',
    clinicId: null,
    workingClinic: null,
    managedClinics: [],
    ownedOrganizations: [],
    providerProfile: null,
    role: { id: 'role-1', priority: 50, capabilities: [] },
    grantedCapabilities: [],
    ...overrides,
  });

  const resolveWith = async (user: Record<string, unknown>) => {
    const queryBus = { execute: jest.fn().mockResolvedValue({ data: user }) };
    const prisma = { user: { upsert: jest.fn() } };

    const resolver = new DbActorContextResolver(
      queryBus as unknown as TSQueryBus,
      prisma as unknown as PrismaService
    );

    return resolver.resolve(token);
  };

  it('personelin kiracısı çalıştığı kliniğin organizasyonudur', async () => {
    const actor = await resolveWith(
      buildUser({
        clinicId: 'clinic-1',
        workingClinic: { organizationId: 'org-1' },
      })
    );

    expect(actor?.organizationId).toBe('org-1');
  });

  it('kliniği olmayan tek-organizasyon sahibinde sahiplikten çözülür', async () => {
    const actor = await resolveWith(
      buildUser({ ownedOrganizations: [{ id: 'org-1' }] })
    );

    expect(actor?.organizationId).toBe('org-1');
  });

  it('şube müdürünün yönettiği klinikler aynı organizasyondaysa o organizasyondur', async () => {
    const actor = await resolveWith(
      buildUser({
        managedClinics: [
          { id: 'clinic-1', organizationId: 'org-1' },
          { id: 'clinic-2', organizationId: 'org-1' },
        ],
      })
    );

    expect(actor?.organizationId).toBe('org-1');
  });

  it('birden çok organizasyona sahip aktörde BOŞ bırakılır — ilk kayıt seçilmez', async () => {
    const actor = await resolveWith(
      buildUser({
        ownedOrganizations: [{ id: 'org-1' }, { id: 'org-2' }],
      })
    );

    // `ownedOrganizations[0]` seçilseydi Prisma'nın sırasız döndürdüğü ilişki
    // yüzünden kiracı istekler arasında değişebilirdi.
    expect(actor?.organizationId).toBeUndefined();
  });

  it('yönetilen klinikler farklı organizasyonlara dağılmışsa boş bırakılır', async () => {
    const actor = await resolveWith(
      buildUser({
        managedClinics: [
          { id: 'clinic-1', organizationId: 'org-1' },
          { id: 'clinic-2', organizationId: 'org-2' },
        ],
      })
    );

    expect(actor?.organizationId).toBeUndefined();
  });

  it('hiçbir kiracı bağı yoksa boş döner', async () => {
    const actor = await resolveWith(buildUser({}));

    expect(actor?.organizationId).toBeUndefined();
  });

  it('managedClinics ActorContext’e yalnız kimliklerle taşınır', async () => {
    const actor = await resolveWith(
      buildUser({
        managedClinics: [{ id: 'clinic-1', organizationId: 'org-1' }],
      })
    );

    expect(actor?.managedClinics).toEqual([{ id: 'clinic-1' }]);
  });
});
