import { Module } from '@nestjs/common';
import { MeQueryController } from '@modules/identity/user/presentation/http/controllers/me.query.controller';
import { MeCommandController } from '@modules/identity/user/presentation/http/controllers/me.command.controller';
import { UserQueryController } from '@modules/identity/user/presentation/http/controllers/users.query.controller';
import { UserCommandController } from '@modules/identity/user/presentation/http/controllers/users.command.controller';

@Module({ controllers: [MeQueryController, MeCommandController, UserQueryController, UserCommandController] })
export class UserPresentationModule {}
