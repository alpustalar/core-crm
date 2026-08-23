import { Module } from '@nestjs/common';
import { EmployeeRepositoriesModule } from '@modules/hr/employee/infrastructure/persistence/prisma/repositories/repositories.module';
import { EMPLOYEE_LEAVE_ENTITLEMENT_SERVICE } from '@modules/hr/employee/domain/services/leave-entitlement/leave-entitlement.service.interface';
import { EmployeeLeaveEntitlementService } from '@modules/hr/employee/domain/services/leave-entitlement/leave-entitlement.service';

/**
 * Yaprak modül: yalnız domain servisini ve bağımlı olduğu repo'ları taşır. Tüketiciler
 * (ör. `hr/leave`) bunu import eder — `EmployeeModule`'ü DEĞİL. Ana modül import edilse
 * controller'ları ve tüm handler'ları da beraberinde çeker, modül grafiğini şişirir ve
 * döngü riski üretir.
 */
@Module({
  imports: [EmployeeRepositoriesModule],
  providers: [
    {
      provide: EMPLOYEE_LEAVE_ENTITLEMENT_SERVICE,
      useClass: EmployeeLeaveEntitlementService,
    },
  ],
  exports: [EMPLOYEE_LEAVE_ENTITLEMENT_SERVICE],
})
export class EmployeeDomainServicesModule {}
