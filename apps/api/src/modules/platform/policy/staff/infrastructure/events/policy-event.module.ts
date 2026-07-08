import { Module } from '@nestjs/common';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import { PolicyAccessDeniedListener } from './listeners/policy-access-denied.listener';

@Module({
  imports: [AuditLogModule],
  providers: [PolicyAccessDeniedListener],
})
export class PolicyEventModule {}
