import { Module } from '@nestjs/common';
import { IyzicoTerminalAuthService } from './auth/iyzico-terminal-auth.service';
import { IyzicoTerminalTokenStore } from './auth/iyzico-terminal-token.store';
import { IyzicoTerminalService } from './iyzico-terminal.service';

@Module({
  providers: [
    IyzicoTerminalTokenStore,
    IyzicoTerminalAuthService,
    IyzicoTerminalService,
  ],
  exports: [IyzicoTerminalService],
})
export class IyzicoTerminalModule {}
