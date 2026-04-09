"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientSchema = void 0;
const zod_1 = require("zod");
const GenderSchema_1 = require("../inputTypeSchemas/GenderSchema");
const BloodTypeSchema_1 = require("../inputTypeSchemas/BloodTypeSchema");
const PatientStatusSchema_1 = require("../inputTypeSchemas/PatientStatusSchema");
exports.PatientSchema = zod_1.z.object({
    gender: GenderSchema_1.GenderSchema,
    bloodType: BloodTypeSchema_1.BloodTypeSchema.nullable(),
    status: PatientStatusSchema_1.PatientStatusSchema,
    id: zod_1.z.uuid(),
    clinicId: zod_1.z.string().nullable(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    tcNo: zod_1.z.string().nullable(),
    birthDate: zod_1.z.coerce.date().nullable(),
    phone: zod_1.z.string(),
    alternativePhone: zod_1.z.string().nullable(),
    email: zod_1.z.string().nullable(),
    address: zod_1.z.string().nullable(),
    emergencyContact: zod_1.z.string().nullable(),
    allergies: zod_1.z.string().nullable(),
    chronicDiseases: zod_1.z.string().nullable(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    deletedAt: zod_1.z.coerce.date().nullable(),
});
exports.default = exports.PatientSchema;
//# sourceMappingURL=PatientSchema.js.map