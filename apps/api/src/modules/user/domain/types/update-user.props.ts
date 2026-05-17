import { UpdateUserByActor, UserUpdateBySelf } from '@shared';

export type UpdateUserProps =
  | UpdateUserByActor
  | UserUpdateBySelf
  | {
      lastLogin: Date;
    };
