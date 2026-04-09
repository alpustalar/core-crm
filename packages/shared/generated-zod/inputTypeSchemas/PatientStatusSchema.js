"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientStatusSchema = void 0;
const zod_1 = require("zod");
exports.PatientStatusSchema = zod_1.z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DECEASED', 'BLACKLISTED']);
exports.default = exports.PatientStatusSchema;
//# sourceMappingURL=PatientStatusSchema.js.map