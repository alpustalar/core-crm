import { z } from 'zod';

export const MedicalFileScalarFieldEnumSchema = z.enum(['id','clinicId','patientId','doctorId','appointmentId','treatmentId','fileName','fileUrl','fileType']);

export default MedicalFileScalarFieldEnumSchema;
