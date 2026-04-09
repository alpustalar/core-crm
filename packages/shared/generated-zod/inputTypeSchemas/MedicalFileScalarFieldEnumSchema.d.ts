import { z } from 'zod';
export declare const MedicalFileScalarFieldEnumSchema: z.ZodEnum<{
    id: "id";
    clinicId: "clinicId";
    doctorId: "doctorId";
    treatmentId: "treatmentId";
    patientId: "patientId";
    fileType: "fileType";
    appointmentId: "appointmentId";
    fileName: "fileName";
    fileUrl: "fileUrl";
}>;
export default MedicalFileScalarFieldEnumSchema;
