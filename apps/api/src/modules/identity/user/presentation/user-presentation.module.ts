import { Module } from '@nestjs/common';
import { UserCommandModule } from '@modules/identity/user/application/commands/command.module';
import { MeController } from '@modules/identity/user/presentation/controllers/me.controller';
import { UserController } from '@modules/identity/user/presentation/controllers/users.controller';
import { UserQueryModule } from '@modules/identity/user/application/queries/query.module';

@Module({
  imports: [UserQueryModule, UserCommandModule],
  controllers: [MeController, UserController],
})
export class UserPresentationModule {}
