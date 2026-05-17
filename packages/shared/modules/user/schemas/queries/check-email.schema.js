"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckEmailSchema = void 0;
const zod_1 = require("zod");
exports.CheckEmailSchema = zod_1.z.object({
    email: zod_1.z.email({ message: "Geçersiz e-posta formatı" }).trim().toLowerCase(),
});
//# sourceMappingURL=check-email.schema.js.map