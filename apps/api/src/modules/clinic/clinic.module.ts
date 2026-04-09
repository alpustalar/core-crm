import { Module } from '@nestjs/common';
import { RedisModule } from '@common/redis/redis.module';
import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { ClinicUseCaseModule } from '@modules/clinic/application/use-cases/module';
import { ClinicCreatedListener, ClinicDeletedListener, } from './infrastructure/listeners';
import { ClinicController } from '@modules/clinic/presentation/controllers';
import { ClinicModuleApi } from '@modules/clinic/clinic-module.api';

const Listeners = [ClinicCreatedListener, ClinicDeletedListener];

@Module({
  imports: [RedisModule, ClinicUseCaseModule],
  controllers: [ClinicController],
  providers: [ClinicRepository, ClinicModuleApi, ...Listeners],
  exports: [ClinicModuleApi],
})
export class ClinicModule {}
