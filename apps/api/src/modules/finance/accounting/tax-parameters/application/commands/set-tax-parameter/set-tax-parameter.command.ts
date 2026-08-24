import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { SetTaxParameterInput } from '@modules/finance/accounting/tax-parameters/domain/contracts/tax-parameter';

/**
 * Bir (clinicId, key) için yeni bir vergi oranı sürümü açar. Mevcut açık sürüm
 * yeni geçerlilik tarihinde kapatılır (tarih-versiyonlu geçmiş korunur).
 * Oluşturulan parametre id'sini döner.
 */
export class SetTaxParameterCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly input: SetTaxParameterInput,
    public readonly ctx: IGetContext
  ) {}
}
