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
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { ConvertUserToProviderDto } from '@shared/modules/provider/dto/convert-user-to-provider.dto';
import { CreateProviderAvailabilityDto } from '@shared/modules/provider/dto/create-provider-availability.dto';
import { UpdateProviderInfoDto } from '@shared/modules/provider/dto/update-provider-info.dto';
import { SetProviderActiveDto } from '@shared/modules/provider/dto/set-provider-active.dto';
import { SetProviderOperationModeDto } from '@shared/modules/provider/dto/set-provider-operation-mode.dto';
import { SetProviderExaminationDto } from '@shared/modules/provider/dto/set-provider-examination.dto';
import { PaginationDto } from '@shared/common';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { FindAllProvidersQuery } from '@modules/clinical/provider/application/queries';
import { FindProviderByIdQuery } from '@modules/clinical/provider/application/queries/find-provider-by-id/find-provider-by-id.query';
import { ConvertUserToProviderCommand } from '@modules/clinical/provider/application/commands/convert-user-to-provider/convert-user-to-provider.command';
import { CreateProviderAvailabilityCommand } from '@modules/clinical/provider/application/commands/create-provider-availability/create-provider-availability.command';
import { UpdateProviderInfoCommand } from '@modules/clinical/provider/application/commands/update-provider-info/update-provider-info.command';
import { SetProviderActiveCommand } from '@modules/clinical/provider/application/commands/set-provider-active/set-provider-active.command';
import { SetProviderOperationModeCommand } from '@modules/clinical/provider/application/commands/set-provider-operation-mode/set-provider-operation-mode.command';
import { SetProviderExaminationCommand } from '@modules/clinical/provider/application/commands/set-provider-examination/set-provider-examination.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

const { PROVIDER, PROVIDERAVAILABILITY } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class ProviderController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  //? ====================================================================================
  //! QUERIES
  //? ====================================================================================

  @Get()
  @HasCapability(PROVIDER.read)
  findAll(@Query() pagination: PaginationDto, @GetContext() ctx: IGetContext) {
    return this.queryBus.execute(new FindAllProvidersQuery(ctx, pagination));
  }

  @Get(':id')
  @HasCapability(PROVIDER.read)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new FindProviderByIdQuery(id, ctx));
  }

  //? ====================================================================================
  //! COMMANDS
  //? ====================================================================================

  @Post('convert')
  @HasCapability(PROVIDER.create)
  convertUserToProvider(
    @Body() dto: ConvertUserToProviderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new ConvertUserToProviderCommand(ctx, dto));
  }

  @Post('availability')
  @HasCapability(PROVIDERAVAILABILITY.create)
  createAvailability(
    @Body() dto: CreateProviderAvailabilityDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CreateProviderAvailabilityCommand(ctx, dto)
    );
  }

  @Patch(':id/info')
  @HasCapability(PROVIDER.update)
  updateInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderInfoDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateProviderInfoCommand({ providerId: id, data: dto, ctx })
    );
  }

  @Patch(':id/active')
  @HasCapability(PROVIDER.update)
  setActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetProviderActiveDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SetProviderActiveCommand({ providerId: id, data: dto, ctx })
    );
  }

  @Patch(':id/operation-mode')
  @HasCapability(PROVIDER.update)
  setOperationMode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetProviderOperationModeDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SetProviderOperationModeCommand({ providerId: id, data: dto, ctx })
    );
  }

  @Patch(':id/examination')
  @HasCapability(PROVIDER.update)
  setExamination(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetProviderExaminationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SetProviderExaminationCommand({ providerId: id, data: dto, ctx })
    );
  }
}
