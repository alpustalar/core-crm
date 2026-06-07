import { Module } from '@nestjs/common';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  RouterModule,
} from '@nestjs/core';
import { LoggingInterceptor } from '@common/interceptors/logger/logger.interceptor';
import { AllExceptionsFilter } from '@common/filters/all-exceptions-filter';
import { ThrottleMonitorGuard } from '@common/guards/throttle-monitor.guard';
import { ThrottleMonitorListener } from '@common/guards/throttle-monitor.listener';
import { UserModule } from '@modules/identity/user/user.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { FirebaseModule } from '@modules/identity/auth/firebase/firebase.module';
import { MailModule } from '@modules/platform/mail/mail.module';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import { AppointmentModule } from '@modules/clinical/appointment/appointment.module';
import { ClinicModule } from '@modules/organization/clinic/clinic.module';
import { PatientModule } from '@modules/crm/patient/patient.module';
import { TreatmentModule } from '@modules/clinical/treatment/treatment.module';
import { RedisModule } from '@common/redis/redis.module';
import { OrganizationModule } from '@modules/organization/organization/organization.module';
import { MedicalFilesModule } from '@modules/clinical/medical-files/medical-files.module';
import { LookupModule } from '@modules/platform/lookup/lookup.module';
import { AuthModule } from '@modules/identity/auth/auth/auth.module';
import { RegistrationModule } from '@modules/identity/auth/registration/registration.module';
import { RoleModule } from '@modules/identity/role/role.module';
import { InfrastructureModule } from '@src/infrastructure/infrastructure.module';
import { ProviderModule } from '@modules/clinical/provider/provider.module';
import { TransactionInterceptor } from '@common/interceptors/transaction/transaction.interceptor';
import { APP_ROUTES } from '@src/app.routes';
import { ExecutionSourceInterceptor } from '@common/interceptors/execution-source/execution-source.interceptor';
import { FinanceLedgerModule } from '@modules/finance/finance-ledger/finance-ledger.module';
import { TreatmentPackageModule } from '@modules/clinical/treatment-package/treatment-package.module';
import { OutboxModule } from '@src/infrastructure/persistence/prisma/outbox/outbox.module';
import { PatientAuthModule } from '@modules/identity/auth/patient-auth/patient-auth.module';
import { ContextModule } from '@src/infrastructure/context/context.module';
import { TSCqrsModule } from '@common/cqrs/type-safe-cqrs.module';
import { CryptoModule } from '@common/crypto/crypto.module';
import { InvoiceModule } from '@modules/finance/invoice/invoice.module';
import { PosModule } from '@modules/finance/pos/pos.module';
import { PaymentModule } from '@modules/finance/payment/payment.module';
import { MetaAdsModule } from '@modules/crm/meta-ads/meta-ads.module';
import { LeadModule } from '@modules/crm/lead/lead.module';
import { AdminRequestModule } from '@modules/platform/admin-request/admin-request.module';
import { HealthTourismModule } from '@modules/crm/health-tourism/health-tourism.module';

@Module({
  imports: [
    InfrastructureModule,
    ContextModule,
    CryptoModule,
    RouterModule.register(APP_ROUTES),
    FirebaseModule,
    PrismaModule,
    AuthModule,
    TSCqrsModule,
    UserModule,
    MailModule,
    AuditLogModule,
    AppointmentModule,
    FinanceLedgerModule,
    OutboxModule,
    ClinicModule,
    PatientModule,
    PatientAuthModule,
    TreatmentModule,
    TreatmentPackageModule,
    ProviderModule,
    RedisModule,
    OrganizationModule,
    MedicalFilesModule,
    LookupModule,
    RoleModule,
    RegistrationModule,
    InvoiceModule,
    PosModule,
    PaymentModule,
    MetaAdsModule,
    LeadModule,
    AdminRequestModule,
    HealthTourismModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ExecutionSourceInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransactionInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottleMonitorGuard },
    ThrottleMonitorListener,
  ],
})
export class AppModule {}
