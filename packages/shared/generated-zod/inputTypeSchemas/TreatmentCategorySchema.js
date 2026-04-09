"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentCategorySchema = void 0;
const zod_1 = require("zod");
exports.TreatmentCategorySchema = zod_1.z.enum(['DIAGNOSIS', 'RESTORATIVE', 'SURGERY', 'PEDODONTICS', 'PERIODONTOLOGY', 'PROSTHODONTICS', 'ORTHODONTICS', 'COSMETIC', 'OTHER']);
exports.default = exports.TreatmentCategorySchema;
//# sourceMappingURL=TreatmentCategorySchema.js.map