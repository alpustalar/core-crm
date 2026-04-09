import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { Actor, HasCapability } from '@common/decorators';
import { AuthGuard } from '@modules/auth/guards';
import {
  CreateUserUseCase,
  FindOneWithUserIdOrEmailUseCase,
} from '@modules/user/application/use-cases';
import { ActorContext } from '@common/interfaces';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { CAPABILITIES } from '../../../../../../prisma/data';
import { REGISTRY_PATH } from '@modules/user/presentation/controllers/path';
import { CreateUserDto } from '@shared/modules/index';

const { USER } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(USER.create)
@Controller(REGISTRY_PATH)
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
