import { Module } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@common/interceptors/logger/logger.interceptor';
import { AllExceptionsFilter } from '@common/filters/all-exceptions-filter';
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
import { ProviderModule } from '@modules/provider/provider.module';

@Module({
  imports: [
    InfrastructureModule,
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
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
