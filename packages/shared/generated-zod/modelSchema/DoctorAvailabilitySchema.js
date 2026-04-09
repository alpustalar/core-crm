"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorAvailabilitySchema = void 0;
const zod_1 = require("zod");
exports.DoctorAvailabilitySchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    dayOfWeek: zod_1.z.number().int(),
    startMinute: zod_1.z.number().int(),
    endMinute: zod_1.z.number().int(),
    breakStartMinute: zod_1.z.number().int().nullable(),
    breakEndMinute: zod_1.z.number().int().nullable(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date().nullable(),
    doctorId: zod_1.z.string(),
});
exports.default = exports.DoctorAvailabilitySchema;
//# sourceMappingURL=DoctorAvailabilitySchema.js.map