import { IUserStatus } from '@modules/user/domain/repositories/user.repository';

export class ChangeAllUsersStatusInClinicCommand {
  constructor(
    public readonly clinicId: string,
    public readonly status: IUserStatus
  ) {}
}
