"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentSchema = void 0;
const zod_1 = require("zod");
const AppointmentStatusSchema_1 = require("../inputTypeSchemas/AppointmentStatusSchema");
const ExternalSystemSchema_1 = require("../inputTypeSchemas/ExternalSystemSchema");
exports.AppointmentSchema = zod_1.z.object({
    status: AppointmentStatusSchema_1.AppointmentStatusSchema,
    externalSystem: ExternalSystemSchema_1.ExternalSystemSchema.nullable(),
    id: zod_1.z.uuid(),
    patientName: zod_1.z.string(),
    patientPhone: zod_1.z.string(),
    patientEmail: zod_1.z.string().nullable(),
    startTime: zod_1.z.coerce.date(),
    endTime: zod_1.z.coerce.date(),
    treatmentType: zod_1.z.string().nullable(),
    notes: zod_1.z.string().nullable(),
    canceledAt: zod_1.z.coerce.date().nullable(),
    canceledBy: zod_1.z.string().nullable(),
    cancelReason: zod_1.z.string().nullable(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    externalId: zod_1.z.string().nullable(),
    treatmentId: zod_1.z.string(),
    clinicId: zod_1.z.string(),
    doctorId: zod_1.z.string(),
    patientId: zod_1.z.string().nullable(),
    isDeleted: zod_1.z.boolean(),
    deletedAt: zod_1.z.coerce.date(),
});
exports.default = exports.AppointmentSchema;
//# sourceMappingURL=AppointmentSchema.js.map