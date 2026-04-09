"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFileSchema = void 0;
const zod_1 = require("zod");
const FileTypeSchema_1 = require("../inputTypeSchemas/FileTypeSchema");
exports.MedicalFileSchema = zod_1.z.object({
    fileType: FileTypeSchema_1.FileTypeSchema,
    id: zod_1.z.uuid(),
    clinicId: zod_1.z.string(),
    patientId: zod_1.z.string(),
    doctorId: zod_1.z.string(),
    appointmentId: zod_1.z.string().nullable(),
    treatmentId: zod_1.z.string(),
    fileName: zod_1.z.string(),
    fileUrl: zod_1.z.string(),
});
exports.default = exports.MedicalFileSchema;
//# sourceMappingURL=MedicalFileSchema.js.map