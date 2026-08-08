import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Version,
} from '@nestjs/common';
import {
  RegisterClinicAccountDto,
  RegisterUserOrProviderAccountDto,
} from '@shared';
import { RegisterClinicAccountCommand } from '@modules/identity/auth/registration/application/commands/register-clinic-account/register-clinic-account.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RegisterUserOrProviderAccountCommand } from '@modules/identity/auth/registration/application/commands/register-user-or-provider-account';
import { GetContext, IGetContext } from '@common/decorators';

@Controller()
export class RegistrationController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('clinic')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  registerClinicAccount(
    @Body() dto: RegisterClinicAccountDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RegisterClinicAccountCommand({ data: dto, ctx })
    );
  }

  @Post('user')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  registerUserOrProviderAccount(
    @Body() dto: RegisterUserOrProviderAccountDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RegisterUserOrProviderAccountCommand({ data: dto, ctx })
    );
  }
}
