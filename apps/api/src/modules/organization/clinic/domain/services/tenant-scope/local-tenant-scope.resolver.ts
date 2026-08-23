import { Inject, Injectable } from '@nestjs/common';
import { isDefined } from '@common/utils';
import type {
  ITenantScopeResolver,
  TenantScopeInput,
} from '@shared/modules/clinic/interfaces';
import {
  CLINIC_CACHE_SERVICE,
  IClinicCacheService,
} from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import {
  CLINIC_QUERY_REPOSITORY,
  IClinicQueryRepository,
} from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository';
import {
  ClinicNotFoundException,
  TenantScopeMismatchException,
} from '@modules/organization/clinic/domain/exceptions/clinic.exceptions';

/**
 * Aynı süreç içinde (monolit) çalışan çözücü: Redis cache → clinic query repo.
 *
 * Başka bir serviste bu token'a NATS/HTTP adapter'ı bağlanır; tüketici handler'lar
 * değişmez.
 */
@Injectable()
export class LocalTenantScopeResolver implements ITenantScopeResolver {
  constructor(
    @Inject(CLINIC_QUERY_REPOSITORY)
    private readonly clinicRepo: IClinicQueryRepository,
    @Inject(CLINIC_CACHE_SERVICE)
    private readonly cacheService: IClinicCacheService
  ) {}

  /**
   * Kliniğin kiracısını döner.
   *
   * Girdideki `organizationId` **kısa devre değil, doğrulama** yolundan geçer:
   * bu alan çoğu uçta DTO üzerinden istemciden gelir ve olduğu gibi kabul
   * edilirse aktör kendi kliniğinin kimliğiyle başka bir kiracının organizasyon
   * kimliğini eşleştirebilir; kayıt o kiracının org-kapsamlı listelerine düşer.
   * Klinik→organizasyon okuması Redis'te önbelleklendiği için doğrulamanın
   * maliyeti kısa devrenin kazandırdığından düşüktür.
   */
  async resolve(input: TenantScopeInput): Promise<string> {
    const organizationId = await this.resolveFromClinic(input.clinicId);

    if (
      isDefined(input.organizationId) &&
      input.organizationId !== organizationId
    ) {
      throw new TenantScopeMismatchException(
        input.clinicId,
        input.organizationId
      );
    }

    return organizationId;
  }

  private async resolveFromClinic(clinicId: string): Promise<string> {
    const cached = await this.cacheService.clinicOrganizationId().get(clinicId);
    if (cached) return cached.organizationId;

    const clinic = await this.clinicRepo.findById(clinicId);
    if (!clinic) throw new ClinicNotFoundException();

    await this.cacheService
      .clinicOrganizationId()
      .set(clinicId, { organizationId: clinic.organizationId });

    return clinic.organizationId;
  }
}
