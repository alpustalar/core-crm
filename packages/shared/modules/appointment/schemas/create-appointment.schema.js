"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.CreateAppointmentSchema = zod_1.z.object({
    patientId: zod_1.z.uuid({
        message: "Geçerli bir hasta seçilmelidir (UUID formatı).",
    }),
    doctorId: zod_1.z.uuid({
        message: "Geçerli bir doktor seçilmelidir (UUID formatı).",
    }),
    treatmentId: zod_1.z.uuid({
        message: "Geçerli bir tedavi seçilmelidir (UUID formatı).",
    }),
    startTime: zod_1.z.coerce.date().refine((val) => !isNaN(val.getTime()), {
        message: "Geçerli bir randevu tarihi giriniz.",
    }),
    duration: zod_1.z
        .number({ error: "Süre sayısal bir değer olmalıdır." })
        .min(1, { message: "Randevu süresi en az 1 dakika olmalıdır." })
        .optional(),
    notes: zod_1.z.string().optional(),
    clinicId: zod_1.z
        .uuid({ message: "Geçerli bir klinik ID girilmelidir." })
        .optional(),
    externalId: zod_1.z.string().optional(),
});
//# sourceMappingURL=create-appointment.schema.js.map