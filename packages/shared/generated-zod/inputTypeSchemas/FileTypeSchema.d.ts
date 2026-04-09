import { z } from 'zod';
export declare const FileTypeSchema: z.ZodEnum<{
    OTHER: "OTHER";
    XRAY: "XRAY";
    PRESCRIPTION: "PRESCRIPTION";
    PHOTO: "PHOTO";
    CONSENT_FORM: "CONSENT_FORM";
    LAB_RESULT: "LAB_RESULT";
}>;
export type FileTypeType = `${z.infer<typeof FileTypeSchema>}`;
export default FileTypeSchema;
