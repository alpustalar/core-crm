import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpsertClinicGovernmentSpecsDto } from '@shared/modules/governance/dto';

/**
 * Bir kliniğin devlet/regülasyon kimliğini (SKRS tesis kodu, USS şifresi, VKN)
 * oluşturur veya günceller. clinicId unique → idempotent upsert.
 */
export class UpsertClinicGovernmentSpecsCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly dto: UpsertClinicGovernmentSpecsDto,
    public readonly ctx: IGetContext
  ) {}
}
