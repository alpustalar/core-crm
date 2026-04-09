"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClinicSchema = void 0;
const zod_1 = require("zod");
const generated_zod_1 = require("../../../generated-zod");
exports.CreateClinicSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, { message: "İsim en az 2 karakter olmalıdır" })
        .max(100, { message: "İsim en fazla 100 karakter olabilir" }),
    phone: zod_1.z
        .string()
        .min(7, { message: "Telefon numarası çok kısa" })
        .max(20, { message: "Telefon numarası çok uzun" })
        .optional(),
    email: zod_1.z.email({ message: "Geçersiz e-posta formatı" }).optional(),
    address: zod_1.z
        .string()
        .min(5, { message: "Adres çok kısa" })
        .max(500, { message: "Adres çok uzun" })
        .optional(),
    city: zod_1.z
        .string()
        .min(2, { message: "Şehir ismi çok kısa" })
        .max(50, { message: "Şehir ismi çok uzun" })
        .optional(),
    district: zod_1.z
        .string()
        .min(2, { message: "İlçe ismi çok kısa" })
        .max(50, { message: "İlçe ismi çok uzun" })
        .optional(),
    status: generated_zod_1.GlobalStatusSchema.optional(),
    timezone: zod_1.z.string().optional(),
    organizationId: zod_1.z
        .uuid({ message: "Geçersiz organizasyon ID formatı" })
        .optional(),
});
//# sourceMappingURL=create-clinic.schema.js.map