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
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@modules/auth/guards';
import { HasCapability } from '@common/decorators';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { THROTTLE_CONFIG } from '@common/constants';
import {
  CheckEmailDto,
  PaginationDto,
  UpdateUserByActorDto,
  UserSoftDeleteByActorDto,
} from '@shared';
import { Serialize } from '@modules/user/presentation/decorators/serialize.decorator';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { UpdateUserByStaffCommand } from '@modules/user/application/commands/update-user-by-staff';
import { SoftDeleteUserByStaffCommand } from '@modules/user/application/commands/soft-delete-user-by-staff';
import { SendVerificationEmailCommand } from '@modules/user/application/commands/send-verification-email';
import { FindOneWithIdOrEmailQuery } from '@modules/user/application/queries/find-one-with-id-or-email';
import { FindAllUsersForManagerQuery } from '@modules/user/application/queries/find-all-users-for-manager';
import { UserTransformInterceptor } from '@modules/user/presentation/user-transform.interceptor';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

const { USER } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class UserController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @UseInterceptors(UserTransformInterceptor)
  @Get('details/:userIdOrEmail')
  @Version('1')
  @HasCapability(USER.read)
  @Serialize()
  findOneWithUserIdOrEmail(
    @GetContext() ctx: IGetContext,
    @Param('userIdOrEmail') userIdOrEmail: string
  ) {
    return this.queryBus.execute(
      new FindOneWithIdOrEmailQuery(userIdOrEmail, ctx)
    );
  }

  @Post('email-verification')
  @Version('1')
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.NO_CONTENT)
  sendEmailVerificationLink(@Body('email') { email }: CheckEmailDto) {
    return this.commandBus.execute(new SendVerificationEmailCommand(email));
  }
  @Patch(':id')
  @Version('1')
  @HasCapability(USER.update)
  updateUserByActor(
    @Param('id') id: string,
    @Body() dto: UpdateUserByActorDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new UpdateUserByStaffCommand(id, dto, ctx));
  }

  @Patch('soft-delete')
  @Version('1')
  @HasCapability(USER.delete)
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  softDelete(
    @Body() dto: UserSoftDeleteByActorDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new SoftDeleteUserByStaffCommand(dto, ctx));
  }

  @Get('all')
  @Version('1')
  @HasCapability(USER.read)
  @Serialize()
  findAllUsers(
    @Query() paginationDto: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new FindAllUsersForManagerQuery(paginationDto, ctx)
    );
  }
}
