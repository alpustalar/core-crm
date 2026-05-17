"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdateBySelfSchema = void 0;
const zod_1 = require("zod");
exports.UserUpdateBySelfSchema = zod_1.z.object({
    displayName: zod_1.z
        .string()
        .min(2, { message: "İsim en az 2 karakter olmalıdır" })
        .optional(),
    phoneNumber: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, {
        message: "Geçersiz telefon numarası formatı",
    })
        .optional(),
    picture: zod_1.z.url({ message: "Geçersiz profil resmi bağlantısı" }).optional(),
});
//# sourceMappingURL=user-update-by-self.schema.js.map