import { LocalTenantScopeResolver } from './local-tenant-scope.resolver';
import {
  ClinicNotFoundException,
  TenantScopeMismatchException,
} from '@modules/organization/clinic/domain/exceptions/clinic.exceptions';

/**
 * `organizationId` çoğu uçta DTO üzerinden İSTEMCİDEN gelir. Eskiden kısa devre
 * yapılıyordu (gelen değer doğrudan dönüyordu); bu, kendi kliniğinin kimliğiyle
 * başka bir kiracının organizasyon kimliğini eşleştirip kaydı o kiracının
 * org-kapsamlı listelerine enjekte etmeye açıktı. Artık doğrulanıyor.
 */
describe('LocalTenantScopeResolver', () => {
  const CLINIC = 'clinic-1';
  const ORG = 'org-1';

  const build = (clinic: { organizationId: string } | null, cached = false) => {
    const cache = {
      get: jest.fn().mockResolvedValue(cached ? { organizationId: ORG } : null),
      set: jest.fn(),
    };
    const clinicRepo = { findById: jest.fn().mockResolvedValue(clinic) };

    const resolver = new LocalTenantScopeResolver(
      clinicRepo as never,
      { clinicOrganizationId: () => cache } as never
    );

    return { resolver, cache, clinicRepo };
  };

  it('organizationId gelmediğinde klinikten çözer ve önbelleğe yazar', async () => {
    const { resolver, cache } = build({ organizationId: ORG });

    await expect(resolver.resolve({ clinicId: CLINIC })).resolves.toBe(ORG);
    expect(cache.set).toHaveBeenCalledWith(CLINIC, { organizationId: ORG });
  });

  it('gönderilen organizationId kliniğinkiyle uyuşuyorsa kabul edilir', async () => {
    const { resolver } = build({ organizationId: ORG });

    await expect(
      resolver.resolve({ clinicId: CLINIC, organizationId: ORG })
    ).resolves.toBe(ORG);
  });

  it('uyuşmayan organizationId reddedilir — istemcinin gönderdiği değer dönmez', async () => {
    const { resolver } = build({ organizationId: ORG });

    await expect(
      resolver.resolve({ clinicId: CLINIC, organizationId: 'victim-org' })
    ).rejects.toThrow(TenantScopeMismatchException);
  });

  it('doğrulama önbellekten okurken de yapılır', async () => {
    const { resolver, clinicRepo } = build(null, true);

    await expect(
      resolver.resolve({ clinicId: CLINIC, organizationId: 'victim-org' })
    ).rejects.toThrow(TenantScopeMismatchException);
    // Önbellek isabet ettiği için DB'ye hiç gidilmedi ama kontrol atlanmadı.
    expect(clinicRepo.findById).not.toHaveBeenCalled();
  });

  it('klinik yoksa ClinicNotFoundException', async () => {
    const { resolver } = build(null);

    await expect(resolver.resolve({ clinicId: CLINIC })).rejects.toThrow(
      ClinicNotFoundException
    );
  });
});
