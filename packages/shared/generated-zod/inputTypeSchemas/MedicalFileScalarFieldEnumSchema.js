"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFileScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.MedicalFileScalarFieldEnumSchema = zod_1.z.enum(['id', 'clinicId', 'patientId', 'doctorId', 'appointmentId', 'treatmentId', 'fileName', 'fileUrl', 'fileType']);
exports.default = exports.MedicalFileScalarFieldEnumSchema;
//# sourceMappingURL=MedicalFileScalarFieldEnumSchema.js.map