import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TokenAuthGuard } from '@src/auth';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ConfigureAiAgentDto } from '@shared/modules/messaging/dto/commands';
import { ConfigureClinicAiAgentCommand } from '@modules/ai-agent/application/commands/configure-clinic-ai-agent/configure-clinic-ai-agent.command';
import { SetClinicAiAgentEnabledCommand } from '@modules/ai-agent/application/commands/set-clinic-ai-agent-enabled/set-clinic-ai-agent-enabled.command';
import { GetClinicAiAgentConfigQuery } from '@modules/ai-agent/application/queries/get-clinic-ai-agent-config/get-clinic-ai-agent-config.query';

@UseGuards(TokenAuthGuard)
@Controller('clinics/:clinicId/ai-agent')
export class AiAgentController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get()
  get(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicAiAgentConfigQuery(clinicId, ctx)
    );
  }

  @Patch()
  configure(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Body() dto: ConfigureAiAgentDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ConfigureClinicAiAgentCommand({ clinicId, input: dto, ctx })
    );
  }

  @Post('enable')
  @HttpCode(HttpStatus.NO_CONTENT)
  enable(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SetClinicAiAgentEnabledCommand({ clinicId, enabled: true, ctx })
    );
  }

  @Post('disable')
  @HttpCode(HttpStatus.NO_CONTENT)
  disable(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SetClinicAiAgentEnabledCommand({ clinicId, enabled: false, ctx })
    );
  }
}
