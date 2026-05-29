import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards';
import { CreateClinicDto, RegisterClinicSubMerchantDto, UpdateClinicDto } from '@shared';
import { CreateClinicCommand } from '@modules/clinic/application/commands/create-clinic/create-clinic.command';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { UpdateClinicCommand } from '@modules/clinic/application/commands/update-clinic/update-clinic.command';
import { RegisterClinicSubMerchantCommand } from '@modules/clinic/application/commands/register-submerchant/register-submerchant.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@UseGuards(AuthGuard)
@Controller()
export class ClinicController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('')
  create(@Body() dto: CreateClinicDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateClinicCommand(dto, ctx));
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClinicDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new UpdateClinicCommand(id, dto, ctx));
  }

  @Put(':id/sub-merchant')
  registerSubMerchant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegisterClinicSubMerchantDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new RegisterClinicSubMerchantCommand(id, dto, ctx));
  }
}
