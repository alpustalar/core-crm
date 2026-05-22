import { Global, Module } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/context/context.service';
import { CONTEXT_SERVICE } from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Global()
@Module({
  providers: [
    {
      provide: CONTEXT_SERVICE,
      useClass: ContextService,
    },
  ],
  exports: [CONTEXT_SERVICE],
})
export class ContextModule {}
