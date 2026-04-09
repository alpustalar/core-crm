"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicSchema = void 0;
const zod_1 = require("zod");
const GlobalStatusSchema_1 = require("../inputTypeSchemas/GlobalStatusSchema");
exports.ClinicSchema = zod_1.z.object({
    status: GlobalStatusSchema_1.GlobalStatusSchema,
    id: zod_1.z.uuid(),
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    phone: zod_1.z.string().nullable(),
    email: zod_1.z.string().nullable(),
    address: zod_1.z.string().nullable(),
    city: zod_1.z.string().nullable(),
    district: zod_1.z.string().nullable(),
    timezone: zod_1.z.string(),
    logo: zod_1.z.string().nullable(),
    organizationId: zod_1.z.string().nullable(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    deletedAt: zod_1.z.coerce.date().nullable(),
});
exports.default = exports.ClinicSchema;
//# sourceMappingURL=ClinicSchema.js.map