import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import {
  CreateConsentTemplateDto,
  SignConsentFormDto,
  UpdateConsentTemplateDto,
} from '@shared/modules/consent-form/dto/commands';
import { GetConsentTemplatesFilterDto } from '@shared/modules/consent-form/dto/queries';
import { CreateConsentTemplateCommand } from '@modules/clinical/consent-form/application/commands/create-consent-template/create-consent-template.command';
import { UpdateConsentTemplateCommand } from '@modules/clinical/consent-form/application/commands/update-consent-template/update-consent-template.command';
import { ArchiveConsentTemplateCommand } from '@modules/clinical/consent-form/application/commands/archive-consent-template/archive-consent-template.command';
import { SignConsentFormCommand } from '@modules/clinical/consent-form/application/commands/sign-consent-form/sign-consent-form.command';
import { GetConsentTemplatesQuery } from '@modules/clinical/consent-form/application/queries/get-consent-templates/get-consent-templates.query';
import { GetConsentTemplateByIdQuery } from '@modules/clinical/consent-form/application/queries/get-consent-template-by-id/get-consent-template-by-id.query';
import { GetConsentSubmissionsByPatientQuery } from '@modules/clinical/consent-form/application/queries/get-consent-submissions-by-patient/get-consent-submissions-by-patient.query';
import { GetConsentSubmissionByIdQuery } from '@modules/clinical/consent-form/application/queries/get-consent-submission-by-id/get-consent-submission-by-id.query';

@UseGuards(AuthGuard)
@Controller()
export class ConsentFormController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('consent-templates')
  create(
    @Body() dto: CreateConsentTemplateDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreateConsentTemplateCommand(dto, ctx));
  }

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

  @Put('consent-templates/:templateId/archive')
  archive(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ArchiveConsentTemplateCommand(templateId, ctx)
    );
  }

  @Get('consent-templates')
  list(
    @Query() dto: GetConsentTemplatesFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetConsentTemplatesQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get('consent-templates/:templateId')
  getById(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetConsentTemplateByIdQuery(templateId, ctx)
    );
  }

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

  @Get('patients/:patientId/consent-forms')
  listByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetConsentSubmissionsByPatientQuery({ patientId, pagination, ctx })
    );
  }

  @Get('consent-forms/:submissionId')
  getSubmissionById(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetConsentSubmissionByIdQuery(submissionId, ctx)
    );
  }
}
