import { z } from 'zod';
export declare const DoctorScalarFieldEnumSchema: z.ZodEnum<{
    id: "id";
    clinicId: "clinicId";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
    specialty: "specialty";
    title: "title";
    publicPhone: "publicPhone";
    publicEmail: "publicEmail";
    isActive: "isActive";
    userId: "userId";
}>;
export default DoctorScalarFieldEnumSchema;
