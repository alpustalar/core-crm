"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertUserToDoctorSchema = void 0;
const zod_1 = require("zod");
const generated_zod_1 = require("../../../generated-zod");
exports.ConvertUserToDoctorSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    title: generated_zod_1.DoctorTitleSchema.optional(),
    specialty: zod_1.z.lazy(() => generated_zod_1.DoctorSpecialtySchema),
    publicPhone: zod_1.z.string().optional(),
    publicEmail: zod_1.z.email({ message: "Geçersiz e-posta formatı" }).optional(),
    isActive: zod_1.z.coerce.boolean().default(true),
    clinicId: zod_1.z.uuid({ message: "Geçersiz Klinik ID formatı" }),
});
//# sourceMappingURL=convert-user-to-doctor.schema.js.map