import { ICommand } from '@nestjs/cqrs';

export class RefreshMetaTokensCommand implements ICommand {
  readonly __responseType!: RefreshMetaTokensResponse;
}

export interface RefreshMetaTokensResponse {
  refreshed: number;
  failed: number;
}
