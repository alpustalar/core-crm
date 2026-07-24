import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpsertClinicGovernmentSpecs } from '@shared';

/**
 * Bir kliniğin devlet/regülasyon kimliğini (SKRS tesis kodu, USS şifresi, VKN)
 * oluşturur veya günceller. clinicId unique → idempotent upsert.
 */
export class UpsertClinicGovernmentSpecsCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      clinicId: string;
      data: UpsertClinicGovernmentSpecs;
      ctx: IGetContext;
    }
  ) {}
}
