"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserByActorSchema = void 0;
const zod_1 = require("zod");
const modules_1 = require("../../../..");
const generated_zod_1 = require("../../../../../generated-zod");
exports.UpdateUserByActorSchema = zod_1.z.lazy(() => modules_1.CreateUserSchema.partial().extend({
    roleId: zod_1.z.uuid({ message: "Geçersiz Role ID formatı" }).optional(),
    status: generated_zod_1.UserStatusSchema.optional(),
    picture: zod_1.z.url({ message: "Geçersiz resim bağlantısı" }).optional(),
    clinicId: zod_1.z.uuid({ message: "Geçersiz Klinik ID formatı" }).optional(),
    managedClinicIds: zod_1.z
        .array(zod_1.z.uuid({ message: "Dizi içindeki Klinik ID geçersiz formatta" }))
        .optional(),
    ownedOrganizationIds: zod_1.z
        .array(zod_1.z.uuid({ message: "Dizi içindeki Organizasyon ID geçersiz formatta" }))
        .optional(),
}));
//# sourceMappingURL=update-user-by-actor.schema.js.map