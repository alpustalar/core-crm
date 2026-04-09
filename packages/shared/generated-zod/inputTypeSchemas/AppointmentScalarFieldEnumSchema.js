"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.AppointmentScalarFieldEnumSchema = zod_1.z.enum(['id', 'patientName', 'patientPhone', 'patientEmail', 'startTime', 'endTime', 'treatmentType', 'notes', 'status', 'canceledAt', 'canceledBy', 'cancelReason', 'createdAt', 'updatedAt', 'externalSystem', 'externalId', 'treatmentId', 'clinicId', 'doctorId', 'patientId', 'isDeleted', 'deletedAt']);
exports.default = exports.AppointmentScalarFieldEnumSchema;
//# sourceMappingURL=AppointmentScalarFieldEnumSchema.js.map