import { ICommand } from '@nestjs/cqrs';
import { LogSource, LogType } from '@src/domain/constants/log-action.constant';

/**
 * Yarım kalmış kayıt akışının telafisi: DB kaydı açılamadıysa Firebase'de
 * oluşmuş kullanıcıyı silme kuyruğuna alır.
 *
 * Kayıt (auth/registration) modülü user modülünün event publisher'ına doğrudan
 * erişemeyeceği için bu command cross-module giriş kapısıdır — event yalnız
 * sahibi olan user modülü içinde fırlatılır.
 */
export class EnqueueForceDeleteUserCommand implements ICommand {
  readonly __responseType!: void;

  constructor(
    public readonly payload: {
      readonly firebaseUid: string;
      readonly actorId: string;
      readonly type: LogType;
      readonly source?: LogSource;
      readonly detail?: string;
    }
  ) {}
}
