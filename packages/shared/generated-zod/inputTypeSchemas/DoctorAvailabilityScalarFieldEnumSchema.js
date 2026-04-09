"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorAvailabilityScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.DoctorAvailabilityScalarFieldEnumSchema = zod_1.z.enum(['id', 'dayOfWeek', 'startMinute', 'endMinute', 'breakStartMinute', 'breakEndMinute', 'createdAt', 'updatedAt', 'doctorId']);
exports.default = exports.DoctorAvailabilityScalarFieldEnumSchema;
//# sourceMappingURL=DoctorAvailabilityScalarFieldEnumSchema.js.map