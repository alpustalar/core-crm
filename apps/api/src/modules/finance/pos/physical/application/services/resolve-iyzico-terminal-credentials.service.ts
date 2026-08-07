import { Inject, Injectable } from '@nestjs/common';
import {
  CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY,
  IClinicIyzicoTerminalConfigCommandRepository,
} from '@modules/finance/pos/physical/domain/repositories/clinic-iyzico-terminal-config.repository';
import { ClinicIyzicoTerminalConfigNotFoundException } from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import type { IyzicoTerminalCredentials } from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/auth/iyzico-terminal-auth.types';

/**
 * Kliniğin iyzico Terminal merchant kimliklerini satellite config'ten çözer.
 * iyzico terminal handler'ları (sale/refund/void/eod) bu servisi paylaşır.
 *
 * Okuma Command Repo'dan yapılır: kimlikler doğrudan bir para hareketini
 * (satış/iade/void) besliyor, dolayısıyla Command Context'e aittir.
 */
@Injectable()
export class ResolveIyzicoTerminalCredentialsService {
  constructor(
    @Inject(CLINIC_IYZICO_TERMINAL_CONFIG_COMMAND_REPOSITORY)
    private readonly configCommandRepo: IClinicIyzicoTerminalConfigCommandRepository
  ) {}

  async resolve(clinicId: string): Promise<IyzicoTerminalCredentials> {
    const config = await this.configCommandRepo.findByClinicId(clinicId);
    if (!config) {
      throw new ClinicIyzicoTerminalConfigNotFoundException();
    }
    return {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      username: config.username,
      password: config.password,
    };
  }
}
