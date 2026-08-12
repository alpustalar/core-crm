import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  CreateConsentTemplateDto,
  SignConsentFormDto,
  UpdateConsentTemplateDto,
} from '@shared/modules/consent-form/dto/commands';
import { CreateConsentTemplateCommand } from '@modules/clinical/consent-form/application/commands/create-consent-template/create-consent-template.command';
import { UpdateConsentTemplateCommand } from '@modules/clinical/consent-form/application/commands/update-consent-template/update-consent-template.command';
import { ArchiveConsentTemplateCommand } from '@modules/clinical/consent-form/application/commands/archive-consent-template/archive-consent-template.command';
import { SignConsentFormCommand } from '@modules/clinical/consent-form/application/commands/sign-consent-form/sign-consent-form.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CONSENTFORMSUBMISSION, CONSENTFORMTEMPLATE } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class ConsentFormCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(CONSENTFORMTEMPLATE.create)
  @Post('consent-templates')
  create(
    @Body() dto: CreateConsentTemplateDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreateConsentTemplateCommand(dto, ctx));
  }

  @HasCapability(CONSENTFORMTEMPLATE.update)
  @Put('consent-templates/:templateId')
  update(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() dto: UpdateConsentTemplateDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateConsentTemplateCommand({ templateId, data: dto, ctx })
    );
  }

  @HasCapability(CONSENTFORMTEMPLATE.delete)
  @Put('consent-templates/:templateId/archive')
  archive(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ArchiveConsentTemplateCommand(templateId, ctx)
    );
  }

  @HasCapability(CONSENTFORMSUBMISSION.create)
  @Post('patients/:patientId/consent-forms/sign')
  sign(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: SignConsentFormDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SignConsentFormCommand({ patientId, data: dto, ctx })
    );
  }
}
