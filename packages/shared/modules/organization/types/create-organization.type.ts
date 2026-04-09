import { z } from 'zod';
import { CreateOrganizationSchema } from '@shared/modules/organization/schemas';

export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
