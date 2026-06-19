import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import { GetConversationsDto } from '@shared/modules/messaging/dto/queries';
import {
  AssignConversationDto,
  SendMessageDto,
} from '@shared/modules/messaging/dto/commands';
import { GetConversationsQuery } from '@modules/messaging/conversation/application/queries/get-conversations/get-conversations.query';
import { GetConversationMessagesQuery } from '@modules/messaging/conversation/application/queries/get-conversation-messages/get-conversation-messages.query';
import { SendMessageCommand } from '@modules/messaging/conversation/application/commands/send-message/send-message.command';
import { CloseConversationCommand } from '@modules/messaging/conversation/application/commands/close-conversation/close-conversation.command';
import { AssignConversationCommand } from '@modules/messaging/conversation/application/commands/assign-conversation/assign-conversation.command';

@UseGuards(AuthGuard)
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
      new GetConversationsQuery(clinicId, dto, pagination, ctx)
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
      new GetConversationMessagesQuery(
        clinicId,
        conversationId,
        pagination,
        ctx
      )
    );
  }

  @Post('clinics/:clinicId/conversations/:conversationId/messages')
  sendMessage(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SendMessageCommand(
        clinicId,
        {
          conversationId,
          type: dto.type,
          body: dto.body,
          mediaUrl: dto.mediaUrl,
        },
        ctx
      )
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
      new CloseConversationCommand(clinicId, conversationId, ctx)
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
      new AssignConversationCommand(
        clinicId,
        conversationId,
        dto.assigneeUserId,
        ctx
      )
    );
  }
}
