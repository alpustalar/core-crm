import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards';
import { CreateClinicDto, UpdateClinicDto } from '@shared';
import { CommandBus } from '@nestjs/cqrs';
import { CreateClinicCommand } from '@modules/clinic/application/commands/create-clinic/create-clinic.command';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { UpdateClinicCommand } from '@modules/clinic/application/commands/update-clinic/update-clinic.command';

@UseGuards(AuthGuard)
@Controller()
export class ClinicController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('')
  create(@Body() dto: CreateClinicDto, @GetContext() context: IGetContext) {
    return this.commandBus.execute(new CreateClinicCommand(dto, context));
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClinicDto,
    @GetContext() context: IGetContext
  ) {
    return this.commandBus.execute(new UpdateClinicCommand(id, dto, context));
  }
}
