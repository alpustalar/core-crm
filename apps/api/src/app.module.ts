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
import { InfrastructureModule } from '@src/infrastructure/infrastructure.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { ProviderModule } from '@modules/provider/provider.module';
import { TransactionInterceptor } from '@common/interceptors/transaction/transaction.interceptor';
import { APP_ROUTES } from '@src/app.routes';
import { ExecutionSourceInterceptor } from '@common/interceptors/execution-source/execution-source.interceptor';

@Module({
  imports: [
    InfrastructureModule,
    RouterModule.register(APP_ROUTES),
    PaymentModule,
    FirebaseModule,
    PrismaModule,
    AuthModule,
    UserModule,
    MailModule,
    AuditLogModule,
    AppointmentModule,
    ClinicModule,
    PatientModule,
    TreatmentModule,
    ProviderModule,
    RedisModule,
    OrganizationModule,
    MedicalFilesModule,
    LookupModule,
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
