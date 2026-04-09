"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.UserScalarFieldEnumSchema = zod_1.z.enum(['id', 'displayName', 'email', 'emailVerified', 'status', 'roleId', 'picture', 'clinicId', 'lastLogin', 'createdAt', 'updatedAt', 'deletedAt']);
exports.default = exports.UserScalarFieldEnumSchema;
//# sourceMappingURL=UserScalarFieldEnumSchema.js.map