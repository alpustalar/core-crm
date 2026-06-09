import { Global, Module } from '@nestjs/common';
import { PolicyFactory } from './application/policy-factory';
import { POLICY_FACTORY } from './domain/interfaces/policy-factory.interface';
import { PolicyEventModule } from './infrastructure/events/policy-event.module';

@Global()
@Module({
  imports: [PolicyEventModule],
  providers: [
    {
      provide: POLICY_FACTORY,
      useClass: PolicyFactory,
    },
  ],
  exports: [POLICY_FACTORY],
})
export class PolicyModule {}
