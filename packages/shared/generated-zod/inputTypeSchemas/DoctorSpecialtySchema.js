"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorSpecialtySchema = void 0;
const zod_1 = require("zod");
exports.DoctorSpecialtySchema = zod_1.z.enum(['GENERAL', 'ENDODONTIST', 'PERIODONTIST', 'ORTHODONTIST', 'PROSTHODONTIST', 'PEDODONTIST', 'ORAL_SURGEON', 'COSMETIC']);
exports.default = exports.DoctorSpecialtySchema;
//# sourceMappingURL=DoctorSpecialtySchema.js.map