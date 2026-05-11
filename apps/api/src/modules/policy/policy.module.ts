import { Global, Module } from '@nestjs/common';
import { PolicyFactory } from './application/policy-factory';
import { POLICY_FACTORY_TOKEN } from './domain/interfaces/policy-factory.interface';

@Global()
@Module({
  providers: [
    {
      provide: POLICY_FACTORY_TOKEN,
      useClass: PolicyFactory,
    },
  ],
  exports: [POLICY_FACTORY_TOKEN],
})
export class PolicyModule {}
