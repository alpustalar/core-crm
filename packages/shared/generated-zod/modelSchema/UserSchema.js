"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const zod_1 = require("zod");
const UserStatusSchema_1 = require("../inputTypeSchemas/UserStatusSchema");
exports.UserSchema = zod_1.z.object({
    status: UserStatusSchema_1.UserStatusSchema,
    id: zod_1.z.string(),
    displayName: zod_1.z.string(),
    email: zod_1.z.string(),
    emailVerified: zod_1.z.boolean(),
    roleId: zod_1.z.string().nullable(),
    picture: zod_1.z.string().nullable(),
    clinicId: zod_1.z.string().nullable(),
    lastLogin: zod_1.z.coerce.date(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    deletedAt: zod_1.z.coerce.date().nullable(),
});
exports.default = exports.UserSchema;
//# sourceMappingURL=UserSchema.js.map