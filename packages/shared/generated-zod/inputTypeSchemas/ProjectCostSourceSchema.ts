import { z } from 'zod';

export const ProjectCostSourceSchema = z.enum(['MANUAL','PURCHASE_INVOICE','WORK_ORDER','PAYROLL']);

export type ProjectCostSourceType = `${z.infer<typeof ProjectCostSourceSchema>}`

export default ProjectCostSourceSchema;
