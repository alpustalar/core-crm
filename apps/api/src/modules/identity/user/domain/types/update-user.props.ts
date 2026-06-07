import { UpdateUserByStaff, UserUpdateBySelf } from '@shared';

export type UpdateUserProps =
  | UpdateUserByStaff
  | UserUpdateBySelf
  | {
      lastLogin: Date;
    };
