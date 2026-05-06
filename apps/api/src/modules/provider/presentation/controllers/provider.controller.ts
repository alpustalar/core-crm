import { Controller } from '@nestjs/common';
import { ProviderPaths } from '@modules/provider/presentation/controllers/paths';

@Controller(ProviderPaths.ROOT)
export class ProviderController {
  constructor() {}
}
