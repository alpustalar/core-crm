"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.ClinicScalarFieldEnumSchema = zod_1.z.enum(['id', 'name', 'slug', 'phone', 'email', 'address', 'city', 'district', 'status', 'timezone', 'logo', 'organizationId', 'createdAt', 'updatedAt', 'deletedAt']);
exports.default = exports.ClinicScalarFieldEnumSchema;
//# sourceMappingURL=ClinicScalarFieldEnumSchema.js.map