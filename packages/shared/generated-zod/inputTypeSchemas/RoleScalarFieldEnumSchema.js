"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.RoleScalarFieldEnumSchema = zod_1.z.enum(['id', 'name', 'slug', 'priority', 'isSystemRole', 'createdAt', 'updatedAt']);
exports.default = exports.RoleScalarFieldEnumSchema;
//# sourceMappingURL=RoleScalarFieldEnumSchema.js.map