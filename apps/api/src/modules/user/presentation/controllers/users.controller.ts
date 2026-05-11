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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@modules/auth/guards';
import { HasCapability } from '@common/decorators';
import { CapabilityGuard } from '@modules/auth/guards/capability/capability.guard';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { THROTTLE_CONFIG } from '@common/constants';
import { CheckEmailDto } from '@shared/modules/user/dto/registry/check-email.dto';
import {
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

const { USER } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @UseInterceptors(UserTransformInterceptor)
  @Get('details/:userIdOrEmail')
  @Version('1')
  @HasCapability(USER.read)
  @Serialize()
  findOneWithUserIdOrEmail(
    @GetContext() context: IGetContext,
    @Param('userIdOrEmail') userIdOrEmail: string
  ) {
    return this.queryBus.execute(
      new FindOneWithIdOrEmailQuery(userIdOrEmail, context)
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
    @GetContext() context: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateUserByStaffCommand(id, dto, context)
    );
  }

  @Patch('soft-delete')
  @Version('1')
  @HasCapability(USER.delete)
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  softDelete(
    @Body() dto: UserSoftDeleteByActorDto,
    @GetContext() context: IGetContext
  ) {
    return this.commandBus.execute(
      new SoftDeleteUserByStaffCommand(dto, context)
    );
  }

  @Get('all')
  @Version('1')
  @HasCapability(USER.read)
  @Serialize()
  findAllUsers(
    @Query() paginationDto: PaginationDto,
    @GetContext() context: IGetContext
  ) {
    return this.queryBus.execute(
      new FindAllUsersForManagerQuery(paginationDto, context)
    );
  }
}
