import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import {
  CreateClinicDto,
  UpdateClinicAppointmentSettingsDto,
  UpdateClinicDto,
} from '@shared';
import { CreateClinicCommand } from '@modules/organization/clinic/application/commands/create-clinic/create-clinic.command';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { UpdateClinicCommand } from '@modules/organization/clinic/application/commands/update-clinic/update-clinic.command';
import { UpdateClinicAppointmentSettingsCommand } from '@modules/organization/clinic/application/commands/update-clinic-appointment-settings/update-clinic-appointment-settings.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@UseGuards(AuthGuard)
@Controller()
export class ClinicController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('')
  create(@Body() dto: CreateClinicDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateClinicCommand({ data: dto, ctx }));
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClinicDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateClinicCommand({ clinicId: id, data: dto, ctx })
    );
  }

  @Patch(':id/appointment-settings')
  updateAppointmentSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClinicAppointmentSettingsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateClinicAppointmentSettingsCommand({
        clinicId: id,
        data: dto,
        ctx,
      })
    );
  }
}
