import { SetMetadata } from '@nestjs/common';

export const REQUIRES_MODULE_KEY = Symbol.for('requires_module_key');

/**
 * Bir endpoint'in kiracının aboneliğinde belirli bir modülün açık olmasını (entitlement) şart koşar.
 * RBAC capability'den AYRI 2. kapıdır; `ModuleEntitlementGuard` ile birlikte kullanılır.
 *
 * @example
 * @UseGuards(AuthGuard, ModuleEntitlementGuard)
 * @RequiresModule('e_invoice')
 */
export const RequiresModule = (moduleKey: string) =>
  SetMetadata(REQUIRES_MODULE_KEY, moduleKey);
