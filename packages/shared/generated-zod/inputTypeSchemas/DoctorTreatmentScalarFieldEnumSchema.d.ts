import { z } from 'zod';
export declare const DoctorTreatmentScalarFieldEnumSchema: z.ZodEnum<{
    id: "id";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
    isActive: "isActive";
    customPrice: "customPrice";
    customDuration: "customDuration";
    doctorId: "doctorId";
    treatmentId: "treatmentId";
}>;
export default DoctorTreatmentScalarFieldEnumSchema;
