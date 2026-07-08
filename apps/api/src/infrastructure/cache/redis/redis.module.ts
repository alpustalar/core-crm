import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

// Cross-cutting cache (auth actor context + subscription entitlements) — global guard'lardan
// erişilebilmesi için @Global. Mevcut açık importlar zararsızca gereksiz kalır.
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
