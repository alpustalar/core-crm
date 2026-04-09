"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.DoctorScalarFieldEnumSchema = zod_1.z.enum(['id', 'title', 'specialty', 'publicPhone', 'publicEmail', 'isActive', 'createdAt', 'updatedAt', 'clinicId', 'userId']);
exports.default = exports.DoctorScalarFieldEnumSchema;
//# sourceMappingURL=DoctorScalarFieldEnumSchema.js.map