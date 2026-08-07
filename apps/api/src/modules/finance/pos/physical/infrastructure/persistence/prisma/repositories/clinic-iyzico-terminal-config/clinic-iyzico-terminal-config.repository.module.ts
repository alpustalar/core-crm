import { Module } from '@nestjs/common';
import { CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY } from '@modules/finance/pos/physical/domain/repositories/clinic-iyzico-terminal-config.repository';
import { ClinicIyzicoTerminalConfigCommandRepository } from './clinic-iyzico-terminal-config.command.repository';

@Module({
  providers: [
    {
      provide: CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY,
      useClass: ClinicIyzicoTerminalConfigCommandRepository,
    },
  ],
  exports: [CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY],
})
export class ClinicIyzicoTerminalConfigRepositoryModule {}
