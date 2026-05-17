import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Version,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterClinicAccountDto } from '@shared';
import { RegisterClinicAccountCommand } from '@modules/registration/application/commands/register-clinic-account/register-clinic-account.command';

@Controller()
export class RegistrationController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('clinic')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  registerClinicAccount(@Body() dto: RegisterClinicAccountDto) {
    return this.commandBus.execute(new RegisterClinicAccountCommand(dto));
  }
}
