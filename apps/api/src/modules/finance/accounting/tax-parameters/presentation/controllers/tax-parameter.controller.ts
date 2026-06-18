import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { SetTaxParameterDto } from '@shared/modules/tax/dto/commands';
import { GetTaxParametersQuery } from '@modules/finance/accounting/tax-parameters/application/queries/get-tax-parameters/get-tax-parameters.query';
import { SetTaxParameterCommand } from '@modules/finance/accounting/tax-parameters/application/commands/set-tax-parameter/set-tax-parameter.command';

@UseGuards(AuthGuard)
@Controller('tax-parameters')
export class TaxParameterController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get()
  list(@GetContext() ctx: IGetContext) {
    return this.queryBus.execute(
      new GetTaxParametersQuery(this.resolveClinicId(ctx), ctx)
    );
  }

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
