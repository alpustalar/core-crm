"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorTreatmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.DoctorTreatmentSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    customPrice: zod_1.z.instanceof(client_1.Prisma.Decimal, { message: "Field 'customPrice' must be a Decimal. Location: ['Models', 'DoctorTreatment']" }).nullable(),
    customDuration: zod_1.z.number().int().nullable(),
    isActive: zod_1.z.boolean(),
    updatedAt: zod_1.z.coerce.date().nullable(),
    createdAt: zod_1.z.coerce.date().nullable(),
    doctorId: zod_1.z.string(),
    treatmentId: zod_1.z.string(),
});
exports.default = exports.DoctorTreatmentSchema;
//# sourceMappingURL=DoctorTreatmentSchema.js.map