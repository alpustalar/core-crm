import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Version,
} from '@nestjs/common';
import { RegisterClinicAccountDto } from '@shared';
import { RegisterClinicAccountCommand } from '@modules/identity/auth/registration/application/commands/register-clinic-account/register-clinic-account.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller()
export class RegistrationController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('clinic')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  registerClinicAccount(@Body() dto: RegisterClinicAccountDto) {
    return this.commandBus.execute(new RegisterClinicAccountCommand(dto));
  }
}
