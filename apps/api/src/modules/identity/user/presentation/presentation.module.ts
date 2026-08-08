import { Module } from '@nestjs/common';
import { MeController } from '@modules/identity/user/presentation/http/controllers/me.controller';
import { UserController } from '@modules/identity/user/presentation/http/controllers/users.controller';

@Module({ controllers: [MeController, UserController] })
export class UserPresentationModule {}
