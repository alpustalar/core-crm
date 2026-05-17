"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeUserPasswordSchema = void 0;
const zod_1 = require("zod");
exports.ChangeUserPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
});
//# sourceMappingURL=change-user-password.schema.js.map