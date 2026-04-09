"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorTreatmentScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.DoctorTreatmentScalarFieldEnumSchema = zod_1.z.enum(['id', 'customPrice', 'customDuration', 'isActive', 'updatedAt', 'createdAt', 'doctorId', 'treatmentId']);
exports.default = exports.DoctorTreatmentScalarFieldEnumSchema;
//# sourceMappingURL=DoctorTreatmentScalarFieldEnumSchema.js.map