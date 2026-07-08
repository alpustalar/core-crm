import { IQuery } from '@nestjs/cqrs';
import { GetTenantEntitlementsResponse } from './get-tenant-entitlements.response';

/** Kiracının (org/klinik) abonelik yetkilerini çözer — ModuleEntitlementGuard cache-miss'te çağırır. */
export class GetTenantEntitlementsQuery implements IQuery {
  readonly __responseType!: GetTenantEntitlementsResponse;
  constructor(
    public readonly organizationId: string,
    public readonly clinicId: string | null = null
  ) {}
}
