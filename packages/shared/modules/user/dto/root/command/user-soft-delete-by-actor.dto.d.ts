declare const UserSoftDeleteByActorDto_base: import("node_modules/nestjs-zod/dist/dto-D-BwC0n0.cjs").t<import("zod").ZodObject<{
    id: import("zod").ZodString;
    clinicId: import("zod").ZodUUID;
    role: import("zod").ZodObject<{
        id: import("zod").ZodUUID;
        name: import("zod").ZodString;
        slug: import("zod").ZodString;
        priority: import("zod").ZodNumber;
        isSystemRole: import("zod").ZodBoolean;
        createdAt: import("zod").ZodCoercedDate<unknown>;
        updatedAt: import("zod").ZodCoercedDate<unknown>;
    }, import("zod/v4/core").$strip>;
}, import("zod/v4/core").$strip>, false>;
export declare class UserSoftDeleteByActorDto extends UserSoftDeleteByActorDto_base {
}
export {};
