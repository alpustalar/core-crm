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
import { UserModule } from '@modules/user/user.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { MailModule } from '@modules/mail/mail.module';
import { AuditLogModule } from '@modules/audit-log/audit-log.module';
import { AppointmentModule } from '@modules/appointment/appointment.module';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { PatientModule } from '@modules/patient/patient.module';
import { TreatmentModule } from '@modules/treatment/treatment.module';
import { RedisModule } from '@common/redis/redis.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { MedicalFilesModule } from '@modules/medical-files/medical-files.module';
import { LookupModule } from '@modules/lookup/lookup.module';
import { AuthModule } from '@modules/auth/auth.module';
import { RegistrationModule } from '@modules/registration/registration.module';
import { RoleModule } from '@modules/role/role.module';
import { InfrastructureModule } from '@src/infrastructure/infrastructure.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { ProviderModule } from '@modules/provider/provider.module';
import { TransactionInterceptor } from '@common/interceptors/transaction/transaction.interceptor';
import { APP_ROUTES } from '@src/app.routes';
import { ExecutionSourceInterceptor } from '@common/interceptors/execution-source/execution-source.interceptor';
import { FinanceLedgerModule } from '@modules/finance-ledger/finance-ledger.module';
import { TreatmentPackageModule } from '@modules/treatment-package/treatment-package.module';
import { OutboxModule } from '@src/infrastructure/persistence/prisma/outbox/outbox.module';
import { PatientAuthModule } from '@modules/patient-auth/patient-auth.module';
import { ContextModule } from '@src/infrastructure/context/context.module';
import { TSCqrsModule } from '@common/cqrs/type-safe-cqrs.module';
import { InvoiceModule } from '@modules/invoice/invoice.module';
import { PosModule } from '@modules/pos/pos.module';
import { MetaAdsModule } from '@modules/meta-ads/meta-ads.module';

@Module({
  imports: [
    InfrastructureModule,
    ContextModule,
    RouterModule.register(APP_ROUTES),
    FirebaseModule,
    PrismaModule,
    AuthModule,
    TSCqrsModule,
    PaymentModule,
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
    MetaAdsModule,
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
