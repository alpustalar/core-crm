import { Module } from '@nestjs/common';
import {
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { MetaAdAccountCommandRepository } from './meta-ad-account.command.repository';
import { MetaAdAccountQueryRepository } from './meta-ad-account.query.repository';

@Module({
  providers: [
    {
      provide: META_AD_ACCOUNT_COMMAND_REPOSITORY,
      useClass: MetaAdAccountCommandRepository,
    },
    {
      provide: META_AD_ACCOUNT_QUERY_REPOSITORY,
      useClass: MetaAdAccountQueryRepository,
    },
  ],
  exports: [META_AD_ACCOUNT_COMMAND_REPOSITORY, META_AD_ACCOUNT_QUERY_REPOSITORY],
})
export class MetaAdAccountRepositoryModule {}
