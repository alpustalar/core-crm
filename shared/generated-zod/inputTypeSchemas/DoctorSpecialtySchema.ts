import { z } from 'zod';

export const DoctorSpecialtySchema = z.enum(['GENERAL','ENDODONTIST','PERIODONTIST','ORTHODONTIST','PROSTHODONTIST','PEDODONTIST','ORAL_SURGEON','COSMETIC']);

export type DoctorSpecialtyType = `${z.infer<typeof DoctorSpecialtySchema>}`

export default DoctorSpecialtySchema;
