import { z } from 'zod';
export declare const UserScalarFieldEnumSchema: z.ZodEnum<{
    id: "id";
    displayName: "displayName";
    email: "email";
    emailVerified: "emailVerified";
    status: "status";
    roleId: "roleId";
    picture: "picture";
    clinicId: "clinicId";
    lastLogin: "lastLogin";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
    deletedAt: "deletedAt";
}>;
export default UserScalarFieldEnumSchema;
