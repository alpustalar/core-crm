import { MeController } from '@modules/user/presentation/controllers/me';
import { RegistryController } from '@modules/user/presentation/controllers/registry';
import { UserController } from '@modules/user/presentation/controllers/root';

export * from './registry';
export * from './root';
export * from './me';

export const UserControllers = [
  MeController,
  RegistryController,
  UserController,
];
