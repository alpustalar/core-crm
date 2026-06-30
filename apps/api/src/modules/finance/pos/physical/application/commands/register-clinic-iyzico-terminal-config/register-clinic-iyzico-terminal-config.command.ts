import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { RegisterClinicIyzicoTerminalConfig } from '@shared/modules/pos/types/commands';

/**
 * Bir kliniğin iyzico Terminal (Host API) merchant kimliklerini oluşturur/günceller
 * ve ClinicIyzicoTerminalConfig satellite'ine yazar (finance bounded-context).
 */
export class RegisterClinicIyzicoTerminalConfigCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly input: RegisterClinicIyzicoTerminalConfig,
    public readonly ctx: IGetContext
  ) {}
}
