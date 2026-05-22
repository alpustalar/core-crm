import { Global, Module } from '@nestjs/common';
import { PolicyFactory } from './application/policy-factory';
import { POLICY_FACTORY } from './domain/interfaces/policy-factory.interface';

@Global()
@Module({
  providers: [
    {
      provide: POLICY_FACTORY,
      useClass: PolicyFactory,
    },
  ],
  exports: [POLICY_FACTORY],
})
export class PolicyModule {}
