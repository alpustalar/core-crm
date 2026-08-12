import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

/**
 * Bir şube için varsayılan vergi parametrelerini (KDV/stopaj/kurumlar) kurar.
 * İdempotent: şubede zaten parametre varsa hiçbir şey yapmaz.
 */
export class InitializeTaxParametersCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      readonly clinicId: string;
      readonly ctx: IGetContext;
      readonly organizationId?: string | null;
    }
  ) {}
}
