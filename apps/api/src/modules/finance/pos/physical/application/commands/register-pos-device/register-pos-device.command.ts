import { IGetContext } from '@common/decorators/get-context.decorator';
import type { RegisterPosDevice } from '@shared/modules/pos/types/commands';

export class RegisterPosDeviceCommand {
  constructor(
    public readonly input: RegisterPosDevice,
    public readonly ctx: IGetContext
  ) {}
}
