import { Global, Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseModule } from '@modules/identity/auth/firebase/firebase.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { UserModule } from '@modules/identity/user/user.module';
import { RedisModule } from '@common/redis/redis.module';

@Global()
@Module({
  imports: [FirebaseModule, PrismaModule, UserModule, RedisModule],
  providers: [AuthService, AuthGuard, Logger],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
