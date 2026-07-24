import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ConnectMetaAccount } from '@shared/modules/meta-ads';
import { ConnectMetaAccountResponse } from '@modules/crm/meta-ads/application/commands/connect-meta-account/connect-meta-account.response';

export interface ConnectMetaAccountCommandPayload {
  clinicId: string;
  data: ConnectMetaAccount;
  ctx: IGetContext;
}

export class ConnectMetaAccountCommand implements ICommand {
  readonly __responseType!: ConnectMetaAccountResponse;
  constructor(public readonly payload: ConnectMetaAccountCommandPayload) {}
}
