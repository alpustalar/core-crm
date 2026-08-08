import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AiProviderSchema } from '@shared';

export type ClinicAiAgentConfigDocument =
  HydratedDocument<ClinicAiAgentConfigModel>;

/**
 * Kliniğin AI sohbet asistanı config'i: persona + (şifreli) sağlayıcı anahtarı + model.
 * Anahtar yoksa adapter platform fallback'ini (ANTHROPIC_API_KEY / GEMINI_API_KEY) kullanır.
 */
@Schema({
  collection: 'clinic_ai_agent_configs',
  timestamps: false,
  versionKey: false,
})
export class ClinicAiAgentConfigModel {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: String, required: true })
  clinicId!: string;

  @Prop({ type: String, required: true })
  organizationId!: string;

  @Prop({ type: Boolean, required: true, default: false })
  isEnabled!: boolean;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(AiProviderSchema.enum),
    default: AiProviderSchema.enum.ANTHROPIC,
  })
  provider!: string;

  @Prop({ type: String, required: true, default: 'claude-haiku-4-5' })
  model!: string;

  @Prop({ type: String, default: null })
  systemPrompt!: string | null;

  /** Kliniğin kendi sağlayıcı anahtarı (şifreli); null → platform anahtarı. */
  @Prop({ type: String, default: null })
  apiKey!: string | null;

  @Prop({ type: Number, default: null })
  maxTokens!: number | null;

  /** 24s servis penceresi dışında AI sussun mu. */
  @Prop({ type: Boolean, required: true, default: true })
  replyOnlyWithinWindow!: boolean;

  @Prop({ type: Object, default: null })
  businessHours!: unknown;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: Date, required: true })
  updatedAt!: Date;

  @Prop({ type: Number, default: 0, select: false })
  lockVersion!: number;
}

export const ClinicAiAgentConfigSchema = SchemaFactory.createForClass(
  ClinicAiAgentConfigModel
);

ClinicAiAgentConfigSchema.index({ clinicId: 1 }, { unique: true });
