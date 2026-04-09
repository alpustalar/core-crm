import { z } from 'zod';
export declare const ClinicScalarFieldEnumSchema: z.ZodEnum<{
    name: "name";
    id: "id";
    email: "email";
    status: "status";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
    deletedAt: "deletedAt";
    slug: "slug";
    phone: "phone";
    address: "address";
    city: "city";
    district: "district";
    timezone: "timezone";
    logo: "logo";
    organizationId: "organizationId";
}>;
export default ClinicScalarFieldEnumSchema;
