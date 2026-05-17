import { User } from '@shared';

export type UserWithRolePriority = User & {
  role: {
    priority: number;
  } | null;
};
