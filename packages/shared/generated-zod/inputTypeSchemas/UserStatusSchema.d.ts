import { z } from 'zod';
export declare const UserStatusSchema: z.ZodEnum<{
    ACTIVE: "ACTIVE";
    DELETED: "DELETED";
    SUSPENDED: "SUSPENDED";
}>;
export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`;
export default UserStatusSchema;
