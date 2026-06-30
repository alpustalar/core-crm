import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  IInstagramGraphApi,
  INSTAGRAM_GRAPH_API,
  InstagramTokenResult,
} from '@modules/messaging/channel-config/domain/interfaces/instagram-graph-api.interface';
import {
  CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY,
  IClinicInstagramChannelCommandRepository,
} from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { ClinicInstagramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-instagram-channel.entity';
import { ConnectClinicInstagramChannelCommand } from './connect-clinic-instagram-channel.command';

@CommandHandler(ConnectClinicInstagramChannelCommand)
export class ConnectClinicInstagramChannelHandler
  implements ICommandHandler<ConnectClinicInstagramChannelCommand, string>
{
  private readonly logger = new Logger(
    ConnectClinicInstagramChannelHandler.name
  );

  constructor(
    @Inject(INSTAGRAM_GRAPH_API)
    private readonly graphApi: IInstagramGraphApi,
    @Inject(CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepo: IClinicInstagramChannelCommandRepository,
    private readonly cipher: TokenCipherService,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: ConnectClinicInstagramChannelCommand
  ): Promise<string> {
    const { clinicId, input, ctx } = command;

    // 1) Yetki kodu → erişim token'ı, ardından uzun-ömürlüye (~60 gün) çevir.
    const shortLived = await this.graphApi.exchangeCodeForToken(input.code);
    const { accessToken, expiresAt } = await this.toLongLived(shortLived);

    // 2) Hesabı app webhook'una (messages) abone et (başarısızsa onboarding durur).
    await this.graphApi.subscribeToWebhooks(input.igUserId, accessToken);

    // 3) Kanalı şifreli token ile kaydet (upsert: connect/reconnect).
    const channel = ClinicInstagramChannel.connect({
      clinicId,
      organizationId: ctx.actor.organizationId!,
      igUserId: input.igUserId,
      pageId: input.pageId,
      username: input.username,
      accessToken: this.cipher.encrypt(accessToken),
      tokenExpiresAt: expiresAt,
    });

    const saved = await this.txManager.run(() =>
      this.channelCommandRepo.save(channel)
    );
    return saved.id;
  }

  /** Kısa-ömürlü token'ı uzun-ömürlüye çevirmeyi dener; başarısızsa kısa-ömürlüyle devam. */
  private async toLongLived(
    short: InstagramTokenResult
  ): Promise<InstagramTokenResult> {
    try {
      return await this.graphApi.exchangeForLongLivedToken(short.accessToken);
    } catch (err) {
      this.logger.warn(
        `Uzun-ömürlü token alınamadı, kısa-ömürlü ile devam: ${
          err instanceof Error ? err.message : err
        }`
      );
      return short;
    }
  }
}
