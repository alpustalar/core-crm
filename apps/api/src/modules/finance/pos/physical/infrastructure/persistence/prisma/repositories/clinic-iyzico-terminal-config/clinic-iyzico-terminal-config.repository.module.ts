import { Module } from '@nestjs/common';
import {
  CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY,
  CLINIC_IYZICO_TERMINAL_CONFIG_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/clinic-iyzico-terminal-config.repository';
import { ClinicIyzicoTerminalConfigCommandRepository } from './clinic-iyzico-terminal-config.command.repository';
import { ClinicIyzicoTerminalConfigQueryRepository } from './clinic-iyzico-terminal-config.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY,
      useClass: ClinicIyzicoTerminalConfigCommandRepository,
    },
    {
      provide: CLINIC_IYZICO_TERMINAL_CONFIG_QUERY_REPOSITORY,
      useClass: ClinicIyzicoTerminalConfigQueryRepository,
    },
  ],
  exports: [
    CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY,
    CLINIC_IYZICO_TERMINAL_CONFIG_QUERY_REPOSITORY,
  ],
})
export class ClinicIyzicoTerminalConfigRepositoryModule {}
