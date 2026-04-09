"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorTitleSchema = void 0;
const zod_1 = require("zod");
exports.DoctorTitleSchema = zod_1.z.enum(['DT', 'UZM_DT', 'DR_DT', 'ASST_PROF_DR', 'ASSOC_PROF_DR', 'PROF_DR', 'ORD_PROF_DR', 'RES_ASST_DR', 'CLINIC_CHIEF', 'CONSULTANT']);
exports.default = exports.DoctorTitleSchema;
//# sourceMappingURL=DoctorTitleSchema.js.map