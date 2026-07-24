import { Global, Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseModule } from '@src/infrastructure/firebase/firebase.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { UserModule } from '@modules/identity/user/user.module';
import { AuthCacheService } from '@modules/identity/auth/auth/infrastructure/cache/auth-cache.service';

@Global()
@Module({
  imports: [FirebaseModule, PrismaModule, UserModule],
  providers: [AuthService, AuthGuard, Logger, AuthCacheService],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
