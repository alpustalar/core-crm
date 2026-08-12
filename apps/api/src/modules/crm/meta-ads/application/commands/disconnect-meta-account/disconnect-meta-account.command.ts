import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

/**
 * Kliniğin bağlı Meta reklam hesabını devre dışı bırakır. Kayıt silinmez —
 * geçmiş kampanya metrikleri ve lead'leri hesaba bağlı kaldığı için yalnız
 * `isActive` kapatılır (senkronizasyon durur).
 */
export class DisconnectMetaAccountCommand implements ICommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      readonly clinicId: string;
      readonly accountId: string;
      readonly ctx: IGetContext;
    }
  ) {}
}
