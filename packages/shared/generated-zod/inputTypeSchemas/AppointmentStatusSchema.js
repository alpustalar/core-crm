"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatusSchema = void 0;
const zod_1 = require("zod");
exports.AppointmentStatusSchema = zod_1.z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOSHOW']);
exports.default = exports.AppointmentStatusSchema;
//# sourceMappingURL=AppointmentStatusSchema.js.map