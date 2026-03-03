import { MeController } from '@modules/user/controllers/me';
import { RegistryController } from '@modules/user/controllers/registry';
import { UserController } from '@modules/user/controllers/root';

export * from './registry';
export * from './root';
export * from './me';

export const UserControllers = [
  MeController,
  RegistryController,
  UserController,
];
