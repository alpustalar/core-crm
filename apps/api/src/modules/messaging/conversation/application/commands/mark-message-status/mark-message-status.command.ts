import { MessageStatus } from '@prisma/client';

/**
 * Giden bir mesajın kanal teslim durumunu günceller (webhook status olayı). externalId
 * ile mesaj bulunur; ileri-yön geçiş idempotenttir. Public webhook akışından dispatch
 * edilir; dönüş void.
 */
export class MarkMessageStatusCommand {
  readonly __responseType!: void;
  constructor(
    public readonly externalId: string,
    public readonly status: MessageStatus,
    public readonly errorReason?: string | null
  ) {}
}
