import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/auth/guards';
import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { ConvertUserToProviderDto } from '@shared/modules/provider/dto/convert-user-to-provider.dto';
import { CreateProviderAvailabilityDto } from '@shared/modules/provider/dto/create-provider-availability.dto';
import { UpdateProviderDto } from '@shared/modules/provider/dto/update-provider.dto';
import { PaginationDto } from '@shared/common';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindAllProvidersQuery } from '@modules/provider/application/queries';
import { FindProviderByIdQuery } from '@modules/provider/application/queries/find-provider-by-id/find-provider-by-id.query';
import {
  ConvertUserToProviderCommand,
  CreateProviderAvailabilityCommand,
  UpdateProviderByStaffCommand,
} from '@modules/provider/application/commands';

const { PROVIDER, PROVIDERAVAILABILITY } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class ProviderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  //? ====================================================================================
  //! QUERIES
  //? ====================================================================================

  @Get()
  @HasCapability(PROVIDER.read)
  findAll(
    @Query() pagination: PaginationDto,
    @GetContext() context: IGetContext
  ) {
    return this.queryBus.execute(
      new FindAllProvidersQuery(context, pagination)
    );
  }

  @Get(':id')
  @HasCapability(PROVIDER.read)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetContext() context: IGetContext
  ) {
    return this.queryBus.execute(new FindProviderByIdQuery(id, context));
  }

  //? ====================================================================================
  //! COMMANDS
  //? ====================================================================================

  @Post('convert')
  @HasCapability(PROVIDER.create)
  convertUserToProvider(
    @Body() dto: ConvertUserToProviderDto,
    @GetContext() context: IGetContext
  ) {
    return this.commandBus.execute(
      new ConvertUserToProviderCommand(context, dto)
    );
  }

  @Post('availability')
  @HasCapability(PROVIDERAVAILABILITY.create)
  createAvailability(
    @Body() dto: CreateProviderAvailabilityDto,
    @GetContext() context: IGetContext
  ) {
    return this.commandBus.execute(
      new CreateProviderAvailabilityCommand(context, dto)
    );
  }

  @Patch(':id')
  @HasCapability(PROVIDER.update)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderDto,
    @GetContext() context: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateProviderByStaffCommand(id, dto, context)
    );
  }
}
