import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@common/guards';
import { Actor, HasCapability } from '@common/decorators';
import { PaginationParamsDto } from '@common/dto';
import { Throttle } from '@nestjs/throttler';
import {
  FindAllUsersUseCase,
  FindOneWithUserIdOrEmailUseCase,
  SendVerificationEmailUseCase,
  SoftDeleteUserByActorUseCase,
  UpdateUserByActorUseCase,
} from '@user-use-cases';
import { ActorContext } from '@common/interfaces';
import { USERS_PATH } from '@modules/user/controllers/path';
import { CapabilityGuard } from '@common/guards/capability/capability.guard';
import { CAPABILITIES } from '../../../../../prisma/data';
import { CheckEmailDto } from '@shared/modules/user/dto/registry/check-email.dto';
import {
  UpdateUserByActorDto,
  UserSoftDeleteByActorDto,
} from '@shared/modules';
import { UserResponseDto } from '@user-dto';

const { USER } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller(USERS_PATH)
export class UserController {
  constructor(
    private readonly updateUserByActorUseCase: UpdateUserByActorUseCase,
    private readonly findOneWithUserIdOrEmailUseCase: FindOneWithUserIdOrEmailUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly softDeleteUserByActorUseCase: SoftDeleteUserByActorUseCase,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
  ) {}

  @Get('detail/:userIdOrEmail')
  @Version('1')
  @HasCapability(USER.read)
  async findOneWithUserIdOrEmail(
    @Actor() actor: ActorContext,
    @Param('userIdOrEmail') userIdOrEmail: string,
  ) {
    const result = await this.findOneWithUserIdOrEmailUseCase.execute(
      userIdOrEmail,
      actor,
    );

    return plainToInstance(UserResponseDto, result.user, {
      ...(result.isGroupActive && {
        groups: result.groups,
      }),
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Version('1')
  @HasCapability(USER.read)
  async findAllUsers(
    @Actor() actor: ActorContext,
    @Query() paginationParamsDto: PaginationParamsDto,
  ) {
    return await this.findAllUsersUseCase.execute(paginationParamsDto);
  }

  @Post('email-verification')
  @Version('1')
  @Throttle({ default: { limit: 3, ttl: 60 * 1000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  sendEmailVerificationLink(@Body('email') { email }: CheckEmailDto) {
    return this.sendVerificationEmailUseCase.execute(email);
  }

  @Patch(':id')
  @Version('1')
  @HasCapability(USER.update)
  updateUserByActor(
    @Param('id') id: string,
    @Body() dto: UpdateUserByActorDto,
    @Actor() actor: ActorContext,
  ) {
    return this.updateUserByActorUseCase.execute(id, dto, actor);
  }

  @Patch('delete')
  @Version('1')
  @HasCapability(USER.delete)
  softDelete(
    @Body() dto: UserSoftDeleteByActorDto,
    @Actor() actor: ActorContext,
  ) {
    return this.softDeleteUserByActorUseCase.execute(dto, actor);
  }
}
