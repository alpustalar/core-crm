import { z } from 'zod';

export const MedicalFileScalarFieldEnumSchema = z.enum(['id','clinicId','patientId','providerId','appointmentId','treatmentId','fileName','fileUrl','fileType']);

export default MedicalFileScalarFieldEnumSchema;
