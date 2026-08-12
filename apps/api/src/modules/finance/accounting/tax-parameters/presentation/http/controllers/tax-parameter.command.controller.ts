import {
  BadRequestException,
  Body,
  Controller,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { SetTaxParameterDto } from '@shared/modules/tax/dto/commands';
import { SetTaxParameterCommand } from '@modules/finance/accounting/tax-parameters/application/commands/set-tax-parameter/set-tax-parameter.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { TAXPARAMETER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('tax-parameters')
export class TaxParameterCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(TAXPARAMETER.update)
  @Put()
  set(@GetContext() ctx: IGetContext, @Body() dto: SetTaxParameterDto) {
    return this.commandBus.execute(
      new SetTaxParameterCommand(
        {
          clinicId: this.resolveClinicId(ctx),
          organizationId: this.resolveOrganizationId(ctx),
          key: dto.key,
          rate: dto.rate,
          validFrom: dto.validFrom,
        },
        ctx
      )
    );
  }

  private resolveClinicId(ctx: IGetContext): string {
    if (!ctx.actor.clinicId) {
      throw new BadRequestException('Aktörün şube (clinic) bağlamı yok.');
    }
    return ctx.actor.clinicId;
  }

  private resolveOrganizationId(ctx: IGetContext): string {
    if (!ctx.actor.organizationId) {
      throw new BadRequestException('Aktörün organization bağlamı yok.');
    }
    return ctx.actor.organizationId;
  }
}
