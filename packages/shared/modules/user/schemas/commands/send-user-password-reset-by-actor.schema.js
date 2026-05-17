"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendUserPasswordResetByActorSchema = void 0;
const zod_1 = require("zod");
exports.SendUserPasswordResetByActorSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, { message: "ID alanı boş bırakılamaz" }),
    clinicId: zod_1.z.uuid({ message: "Geçersiz Klinik ID formatı" }),
});
//# sourceMappingURL=send-user-password-reset-by-actor.schema.js.map