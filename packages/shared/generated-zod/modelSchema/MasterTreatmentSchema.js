"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterTreatmentSchema = void 0;
const zod_1 = require("zod");
const TreatmentCategorySchema_1 = require("../inputTypeSchemas/TreatmentCategorySchema");
exports.MasterTreatmentSchema = zod_1.z.object({
    category: TreatmentCategorySchema_1.TreatmentCategorySchema,
    id: zod_1.z.uuid(),
    name: zod_1.z.string(),
    defaultDuration: zod_1.z.number().int(),
});
exports.default = exports.MasterTreatmentSchema;
//# sourceMappingURL=MasterTreatmentSchema.js.map