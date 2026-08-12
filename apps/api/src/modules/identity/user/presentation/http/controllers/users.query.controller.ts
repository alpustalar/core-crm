import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { HasCapability } from '@common/decorators';
import { CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { PaginationDto, User } from '@shared';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { FindOneWithIdOrEmailQuery } from '@modules/identity/user/application/queries/find-one-with-id-or-email';
import { FindAllUsersForManagerQuery } from '@modules/identity/user/application/queries/find-all-users-for-manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { UserResponseDto } from '@modules/identity/user/presentation/http/dto';
import { Serialize } from '@common/decorators/serialize.decorator';

const { USER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(USER.read)
@Controller()
export class UserQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @Get('details/:userIdOrEmail')
  @Version('1')
  @Serialize<User, UserResponseDto>(UserResponseDto)
  findOneWithUserIdOrEmail(
    @GetContext() ctx: IGetContext,
    @Param('userIdOrEmail') userIdOrEmail: string
  ) {
    return this.queryBus.execute(
      new FindOneWithIdOrEmailQuery(userIdOrEmail, ctx)
    );
  }

  @Get('all')
  @Version('1')
  @Serialize<User, UserResponseDto>(UserResponseDto)
  findAllUsers(
    @Query() paginationDto: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new FindAllUsersForManagerQuery(paginationDto, ctx)
    );
  }
}
