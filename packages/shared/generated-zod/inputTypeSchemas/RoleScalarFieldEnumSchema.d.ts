import { z } from 'zod';
export declare const RoleScalarFieldEnumSchema: z.ZodEnum<{
    name: "name";
    id: "id";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
    slug: "slug";
    priority: "priority";
    isSystemRole: "isSystemRole";
}>;
export default RoleScalarFieldEnumSchema;
