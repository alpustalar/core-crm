import { Module } from '@nestjs/common';
import { RedisModule } from '@common/redis/redis.module';
import { ClinicRepository } from './repositories/clinic.repository';
import { ClinicUseCaseModule } from './use-cases/module';
import {
  ClinicCreatedListener,
  ClinicDeletedListener,
} from './events/listeners';
import { UserModule } from '@modules/user/user.module';
import { ClinicController } from '@modules/clinic/controllers';

const Listeners = [ClinicCreatedListener, ClinicDeletedListener];

@Module({
  imports: [RedisModule, ClinicUseCaseModule, UserModule],
  controllers: [ClinicController],
  providers: [ClinicRepository, ...Listeners],
})
export class ClinicModule {}
