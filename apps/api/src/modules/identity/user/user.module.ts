import { Module } from '@nestjs/common';
import { UserPresentationModule } from '@modules/identity/user/presentation/presentation.module';

@Module({ imports: [UserPresentationModule] })
export class UserModule {}
