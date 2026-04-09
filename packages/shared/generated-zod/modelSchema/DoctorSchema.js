"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorSchema = void 0;
const zod_1 = require("zod");
const DoctorTitleSchema_1 = require("../inputTypeSchemas/DoctorTitleSchema");
const DoctorSpecialtySchema_1 = require("../inputTypeSchemas/DoctorSpecialtySchema");
exports.DoctorSchema = zod_1.z.object({
    title: DoctorTitleSchema_1.DoctorTitleSchema.nullable(),
    specialty: DoctorSpecialtySchema_1.DoctorSpecialtySchema,
    id: zod_1.z.uuid(),
    publicPhone: zod_1.z.string().nullable(),
    publicEmail: zod_1.z.string().nullable(),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    clinicId: zod_1.z.string(),
    userId: zod_1.z.string(),
});
exports.default = exports.DoctorSchema;
//# sourceMappingURL=DoctorSchema.js.map