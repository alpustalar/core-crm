import { Global, Module } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [TSCommandBus, TSQueryBus],
  exports: [TSCommandBus, TSQueryBus],
})
export class TSCqrsModule {}
