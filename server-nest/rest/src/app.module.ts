import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@common/interceptors/logger/logger.interceptor';
import { AllExceptionsFilter } from '@common/filters/all-exceptions-filter';
import { UserModule } from '@modules/user/user.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { MailModule } from '@modules/mail/mail.module';
import { AuditLogModule } from '@modules/audit-log/audit-log.module';
import { AppointmentModule } from '@modules/appointment/appointment.module';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { PatientModule } from '@modules/patient/patient.module';
import { TreatmentModule } from '@modules/treatment/treatment.module';
import { DoctorModule } from '@modules/doctor/doctor.module';
import { RedisModule } from '@common/redis/redis.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { MedicalFilesModule } from '@modules/medical-files/medical-files.module';
import { LookupModule } from '@modules/lookup/lookup.module';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(8080),
        DATABASE_URL: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        ADMIN_EMAIL: Joi.string().email().required(),
        BETTERSTACK_TOKEN: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    IoRedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: config.get<string>('REDIS_URL'),
      }),
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    PrismaModule,
    FirebaseModule,
    MailModule,
    AuditLogModule,
    AppointmentModule,
    ClinicModule,
    PatientModule,
    TreatmentModule,
    DoctorModule,
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
