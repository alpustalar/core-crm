"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentSchema = void 0;
const zod_1 = require("zod");
const TreatmentCategorySchema_1 = require("../inputTypeSchemas/TreatmentCategorySchema");
exports.TreatmentSchema = zod_1.z.object({
    category: TreatmentCategorySchema_1.TreatmentCategorySchema,
    id: zod_1.z.uuid(),
    name: zod_1.z.string(),
    duration: zod_1.z.number().int().nullable(),
    minDuration: zod_1.z.number().int().nullable(),
    maxDuration: zod_1.z.number().int().nullable(),
    description: zod_1.z.string().nullable(),
    isActive: zod_1.z.boolean(),
    requiresApproval: zod_1.z.boolean(),
    isPackageOnly: zod_1.z.boolean(),
    displayOrder: zod_1.z.number().int(),
    clinicId: zod_1.z.string(),
    masterTreatmentId: zod_1.z.string().nullable(),
    createdAt: zod_1.z.coerce.date(),
    deletedAt: zod_1.z.coerce.date().nullable(),
    updatedAt: zod_1.z.coerce.date().nullable(),
});
exports.default = exports.TreatmentSchema;
//# sourceMappingURL=TreatmentSchema.js.map