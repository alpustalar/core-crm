import { Test } from '@nestjs/testing';
import { Global, Module } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { TENANT_SCOPE_RESOLVER } from './tenant-scope.resolver.interface';
import { LocalTenantScopeResolver } from './local-tenant-scope.resolver';
import { CLINIC_QUERY_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository';
import { CLINIC_CACHE_SERVICE } from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import type { ITenantScopeResolver } from '@shared/modules/clinic/interfaces';

/**
 * Nest'in DI hataları çalışma zamanında çıkar — tsc göremez. Bu yüzden token'ın
 * gerçekten çözüldüğü ve global sağlandığı burada sabitlenir.
 *
 * Ağır bağımlılıkları (Prisma, Redis) ayağa kaldırmamak için gerçek
 * `TenantScopeModule` yerine aynı şekilde kurulmuş bir ikizi derlenir; sınanan
 * şey modülün ŞEKLİ: `@Global` + token → LocalTenantScopeResolver.
 */
@Global()
@Module({
  providers: [
    { provide: CLINIC_QUERY_REPOSITORY, useValue: { findById: jest.fn() } },
    { provide: CLINIC_CACHE_SERVICE, useValue: { clinicOrganizationId: jest.fn() } },
    { provide: TENANT_SCOPE_RESOLVER, useClass: LocalTenantScopeResolver },
  ],
  exports: [TENANT_SCOPE_RESOLVER],
})
class TestTenantScopeModule {}

/** Çözücüyü import etmeden inject eden uzak bir tüketici. */
@Injectable()
class RemoteConsumer {
  constructor(
    @Inject(TENANT_SCOPE_RESOLVER)
    readonly resolver: ITenantScopeResolver
  ) {}
}

@Module({ providers: [RemoteConsumer] })
class RemoteConsumerModule {}

describe('TenantScopeModule', () => {
  it('token global sağlanır — tüketici modül hiçbir şey import etmeden çözer', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestTenantScopeModule, RemoteConsumerModule],
    }).compile();

    const consumer = moduleRef.get(RemoteConsumer, { strict: false });

    expect(consumer.resolver).toBeInstanceOf(LocalTenantScopeResolver);
  });

  it('gerçek modül @Global olarak işaretli', async () => {
    const { TenantScopeModule } = await import('./tenant-scope.module');

    // Nest global modülleri bu metadata anahtarıyla işaretler; kalkarsa 15+
    // modülün import'u eksik kalır ve uygulama açılışta patlar.
    expect(Reflect.getMetadata('__module:global__', TenantScopeModule)).toBe(
      true
    );
  });

  it('ClinicDomainServicesModule aynı token’ı ikinci kez sağlamaz', async () => {
    const { ClinicDomainServicesModule } = await import('../services.module');

    const providers: unknown[] =
      Reflect.getMetadata('providers', ClinicDomainServicesModule) ?? [];

    const providesTenantScope = providers.some(
      (p) =>
        typeof p === 'object' &&
        p !== null &&
        (p as { provide?: unknown }).provide === TENANT_SCOPE_RESOLVER
    );

    // İki yerde sağlanırsa hangi örneğin bağlandığı import sırasına kalır.
    expect(providesTenantScope).toBe(false);
  });
});
