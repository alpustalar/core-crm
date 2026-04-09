import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { ENV } from '@common/constants/env.constant';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis/dist/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        [ENV.PORT]: Joi.number().default(8080),
        [ENV.DATABASE_URL]: Joi.string().required(),
        [ENV.MONGODB_URI]: Joi.string().required(),
        [ENV.REDIS_URL]: Joi.string().required(),
        [ENV.ADMIN_EMAIL]: Joi.string().email().required(),
        [ENV.BETTERSTACK_TOKEN]: Joi.string().required(),
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
        uri: config.get<string>(ENV.MONGODB_URI),
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    IoRedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: config.get<string>(ENV.REDIS_URL),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>(ENV.REDIS_URL),
          keyPrefix: 'bull_queue',
        },
      }),
    }),
    EventEmitterModule.forRoot(),
  ],
  exports: [ConfigModule, MongooseModule, BullModule, IoRedisModule],
})
export class InfrastructureModule {}
