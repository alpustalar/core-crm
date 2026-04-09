import { Global, Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { AuthGuard } from '@modules/auth/guards';

@Global()
@Module({
  imports: [FirebaseModule, PrismaModule],
  providers: [AuthService, AuthGuard, Logger],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
