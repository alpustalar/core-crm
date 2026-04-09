"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
const schemas_1 = require("../../../doctor/schemas");
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.email({ message: "Geçersiz e-posta formatı" }).trim().toLowerCase(),
    displayName: zod_1.z.string().min(1, { message: "İsim alanı boş bırakılamaz" }),
    password: zod_1.z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
    picture: zod_1.z.url({ message: "Geçersiz resim bağlantısı" }).optional(),
    roleId: zod_1.z.uuid({ message: "Geçersiz Role ID formatı" }).optional(),
    clinicId: zod_1.z.uuid({ message: "Geçersiz Clinic ID formatı" }).optional(),
    doctorProfile: zod_1.z.lazy(() => schemas_1.CreateDoctorSchema.optional()),
});
//# sourceMappingURL=create-user.schema.js.map