import { Module } from '@nestjs/common';
import { UserCommandModule } from '@modules/user/application/commands/command.module';
import { MeController } from '@modules/user/presentation/controllers/me.controller';
import { RegistryController } from '@modules/user/presentation/controllers/registry.controller';
import { UserController } from '@modules/user/presentation/controllers/users.controller';
import { UserQueryModule } from '@modules/user/application/queries/query.module';

@Module({
  imports: [UserQueryModule, UserCommandModule],
  controllers: [MeController, RegistryController, UserController],
})
export class UserPresentationModule {}
