"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.OrganizationScalarFieldEnumSchema = zod_1.z.enum(['id', 'name', 'slug', 'phone', 'email', 'address', 'city', 'district', 'status', 'timezone', 'createdAt', 'updatedAt', 'deletedAt']);
exports.default = exports.OrganizationScalarFieldEnumSchema;
//# sourceMappingURL=OrganizationScalarFieldEnumSchema.js.map