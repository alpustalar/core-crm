import { Global, Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { AuthGuard } from '@modules/auth/guards';
import { UserModule } from '@modules/user/user.module';

@Global()
@Module({
  imports: [FirebaseModule, PrismaModule, UserModule],
  providers: [AuthService, AuthGuard, Logger],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
