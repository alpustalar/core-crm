"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSoftDeleteByActorSchema = void 0;
const zod_1 = require("zod");
const generated_zod_1 = require("../../../../../generated-zod");
exports.UserSoftDeleteByActorSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, { message: "ID alanı boş bırakılamaz" }),
    clinicId: zod_1.z.uuid({ message: "Geçersiz Klinik ID formatı" }),
    role: generated_zod_1.RoleSchema,
});
//# sourceMappingURL=user-soft-delete-by-actor.schema.js.map