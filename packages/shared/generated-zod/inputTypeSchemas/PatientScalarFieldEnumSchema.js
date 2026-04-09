"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.PatientScalarFieldEnumSchema = zod_1.z.enum(['id', 'clinicId', 'firstName', 'lastName', 'tcNo', 'birthDate', 'gender', 'phone', 'alternativePhone', 'email', 'address', 'emergencyContact', 'allergies', 'chronicDiseases', 'bloodType', 'status', 'createdAt', 'updatedAt', 'deletedAt']);
exports.default = exports.PatientScalarFieldEnumSchema;
//# sourceMappingURL=PatientScalarFieldEnumSchema.js.map