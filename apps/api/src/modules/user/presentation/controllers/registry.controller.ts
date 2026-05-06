import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { Actor, HasCapability } from '@common/decorators';
import { AuthGuard } from '@modules/auth/guards';
import {
  CreateUserUseCase,
  FindOneWithUserIdOrEmailUseCase,
} from '@modules/user/application/use-cases';
import { ActorContext } from '@common/interfaces';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data';
import { UserPaths } from '@modules/user/presentation/controllers/paths';
import { CreateUserDto } from '@shared';

const { USER } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(USER.create)
@Controller(UserPaths.REGISTRY)
export class RegistryController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findOneWithUserIdOrEmailUseCase: FindOneWithUserIdOrEmailUseCase
  ) {}

  @Post('')
  @Version('1')
  create(@Body() dto: CreateUserDto, @Actor() actor: ActorContext) {
    return this.createUserUseCase.execute(dto, actor);
  }

  @Post('check-email')
  @Version('1')
  checkEmail(@Body('email') email: string, @Actor() actor: ActorContext) {
    return this.findOneWithUserIdOrEmailUseCase.execute(email, actor);
  }
}
