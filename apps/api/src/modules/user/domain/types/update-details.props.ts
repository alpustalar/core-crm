import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';

export interface UpdateDetailsProps {
  displayName?: string;
  picture?: string | null;
  phoneNumber?: string | null;
  status?: GlobalStatusType;
  roleId?: string | null;
  clinicId?: string | null;
}
