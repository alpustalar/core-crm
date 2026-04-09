"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.CreateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Organizasyon adı boş bırakılamaz" }),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.email({ message: "Geçersiz e-posta formatı" }).optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
});
//# sourceMappingURL=create-organization.schema.js.map