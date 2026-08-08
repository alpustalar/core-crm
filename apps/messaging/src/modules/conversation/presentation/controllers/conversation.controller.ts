import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { TokenAuthGuard } from '@src/auth';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import {
  GetConversationsDto,
  GetWhatsappUsageDto,
} from '@shared/modules/messaging/dto/queries';
import {
  AssignConversationDto,
  SendMessageDto,
  SendTemplateMessageDto,
} from '@shared/modules/messaging/dto/commands';
import { GetConversationsQuery } from '@modules/conversation/application/queries/get-conversations/get-conversations.query';
import { GetConversationMessagesQuery } from '@modules/conversation/application/queries/get-conversation-messages/get-conversation-messages.query';
import { GetInboundMediaQuery } from '@modules/conversation/application/queries/get-inbound-media/get-inbound-media.query';
import { GetWhatsappUsageQuery } from '@modules/conversation/application/queries/get-whatsapp-usage/get-whatsapp-usage.query';
import { SendMessageCommand } from '@modules/conversation/application/commands/send-message/send-message.command';
import { SendTemplateMessageCommand } from '@modules/conversation/application/commands/send-template-message/send-template-message.command';
import { MarkConversationReadCommand } from '@modules/conversation/application/commands/mark-conversation-read/mark-conversation-read.command';
import { CloseConversationCommand } from '@modules/conversation/application/commands/close-conversation/close-conversation.command';
import { AssignConversationCommand } from '@modules/conversation/application/commands/assign-conversation/assign-conversation.command';

@UseGuards(TokenAuthGuard)
@Controller()
export class ConversationController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get('clinics/:clinicId/conversations')
  getConversations(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() dto: GetConversationsDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetConversationsQuery({ clinicId, filter: dto, pagination, ctx })
    );
  }

  @Get('clinics/:clinicId/whatsapp-usage')
  getUsage(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() dto: GetWhatsappUsageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetWhatsappUsageQuery({ clinicId, from: dto.from, to: dto.to, ctx })
    );
  }

  @Get('clinics/:clinicId/conversations/:conversationId/messages')
  getMessages(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetConversationMessagesQuery({
        clinicId,
        conversationId,
        pagination,
        ctx,
      })
    );
  }

  @Get(
    'clinics/:clinicId/conversations/:conversationId/messages/:messageId/media'
  )
  async getInboundMedia(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @GetContext() ctx: IGetContext
  ): Promise<StreamableFile> {
    const { data } = await this.queryBus.execute(
      new GetInboundMediaQuery({ clinicId, conversationId, messageId, ctx })
    );
    if (!data) {
      throw new NotFoundException(
        'Medya bulunamadı veya süresi dolmuş (Meta ~30 gün saklar).'
      );
    }
    return new StreamableFile(data.content, { type: data.mimeType });
  }

  @Post('clinics/:clinicId/conversations/:conversationId/messages')
  sendMessage(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SendMessageCommand({
        clinicId,
        input: {
          conversationId,
          type: dto.type,
          body: dto.body,
          mediaUrl: dto.mediaUrl,
          mediaType: dto.mediaType,
        },
        ctx,
      })
    );
  }

  @Post('clinics/:clinicId/conversations/:conversationId/template-messages')
  sendTemplate(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendTemplateMessageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SendTemplateMessageCommand({
        clinicId,
        ctx,
        input: {
          conversationId,
          templateName: dto.templateName,
          languageCode: dto.languageCode,
          variables: dto.variables,
          headerText: dto.headerText,
          headerMediaUrl: dto.headerMediaUrl,
          headerMediaType: dto.headerMediaType,
          buttonParams: dto.buttonParams,
          category: dto.category,
        },
      })
    );
  }

  @Post('clinics/:clinicId/conversations/:conversationId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  markRead(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new MarkConversationReadCommand({ clinicId, conversationId, ctx })
    );
  }

  @Post('clinics/:clinicId/conversations/:conversationId/close')
  @HttpCode(HttpStatus.NO_CONTENT)
  closeConversation(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CloseConversationCommand({ clinicId, conversationId, ctx })
    );
  }

  @Post('clinics/:clinicId/conversations/:conversationId/assign')
  @HttpCode(HttpStatus.NO_CONTENT)
  assignConversation(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: AssignConversationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AssignConversationCommand({
        clinicId,
        conversationId: conversationId,
        assigneeUserId: dto.assigneeUserId,
        ctx,
      })
    );
  }
}
