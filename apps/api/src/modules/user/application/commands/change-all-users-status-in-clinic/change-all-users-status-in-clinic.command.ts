import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';

export class ChangeAllUsersStatusInClinicCommand {
  constructor(
    public readonly clinicId: string,
    public readonly status: GlobalStatusType
  ) {}
}
