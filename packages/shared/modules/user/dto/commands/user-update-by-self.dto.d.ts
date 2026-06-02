declare const UserUpdateBySelfDto_base: import("node_modules/nestjs-zod/dist/dto-D-BwC0n0.cjs").t<import("zod").ZodObject<{
    displayName: import("zod").ZodOptional<import("zod").ZodString>;
    phoneNumber: import("zod").ZodOptional<import("zod").ZodString>;
    picture: import("zod").ZodOptional<import("zod").ZodURL>;
}, import("zod/v4/core").$strip>, false>;
export declare class UserUpdateBySelfDto extends UserUpdateBySelfDto_base {
}
export {};
