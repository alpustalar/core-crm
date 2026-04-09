import { z } from 'zod';
export declare const OrganizationScalarFieldEnumSchema: z.ZodEnum<{
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
}>;
export default OrganizationScalarFieldEnumSchema;
