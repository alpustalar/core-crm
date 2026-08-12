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
import { ClinicNotFoundException } from '@modules/organization/clinic/domain/exceptions/clinic.exceptions';

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

  async resolve(input: TenantScopeInput): Promise<string> {
    if (isDefined(input.organizationId)) return input.organizationId;

    const clinicId = input.clinicId;

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
