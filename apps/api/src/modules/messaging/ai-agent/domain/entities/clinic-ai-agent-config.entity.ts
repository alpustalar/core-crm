import { ClinicAiAgentConfig as IClinicAiAgentConfig } from '@shared/generated-zod';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  CreateClinicAiAgentConfigProps,
  UpdateClinicAiAgentConfigProps,
} from '../types/create-clinic-ai-agent-config.props';

/**
 * Kliniğin AI sohbet asistanı config'i (messaging bounded-context). Clinic'ten ayrıştırılmış
 * 1:1 satellite; persona (systemPrompt), model ve (şifreli) Anthropic anahtarını barındırır.
 * Gelen mesajlara otomatik yanıt akışı (AiReplyProcessor) bu kayıttan beslenir.
 */
export class ClinicAiAgentConfig
  extends AggregateRoot
  implements IClinicAiAgentConfig
{
  constructor(data: IClinicAiAgentConfig) {
    super();
    this._id = data.id;
    this._isEnabled = data.isEnabled;
    this._provider = data.provider;
    this._model = data.model;
    this._systemPrompt = data.systemPrompt;
    this._apiKey = data.apiKey;
    this._maxTokens = data.maxTokens;
    this._replyOnlyWithinWindow = data.replyOnlyWithinWindow;
    this._businessHours = data.businessHours;
    this._clinicId = data.clinicId;
    this._organizationId = data.organizationId;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _isEnabled: boolean;
  get isEnabled(): boolean {
    return this._isEnabled;
  }

  private _provider: IClinicAiAgentConfig['provider'];
  get provider(): IClinicAiAgentConfig['provider'] {
    return this._provider;
  }

  private _model: string;
  get model(): string {
    return this._model;
  }

  private _systemPrompt: string | null;
  get systemPrompt(): string | null {
    return this._systemPrompt;
  }

  private _apiKey: string | null;
  get apiKey(): string | null {
    return this._apiKey;
  }

  private _maxTokens: number | null;
  get maxTokens(): number | null {
    return this._maxTokens;
  }

  private _replyOnlyWithinWindow: boolean;
  get replyOnlyWithinWindow(): boolean {
    return this._replyOnlyWithinWindow;
  }

  private _businessHours: IClinicAiAgentConfig['businessHours'];
  get businessHours(): IClinicAiAgentConfig['businessHours'] {
    return this._businessHours;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(
    props: CreateClinicAiAgentConfigProps
  ): ClinicAiAgentConfig {
    const now = new Date();
    return new ClinicAiAgentConfig({
      id: props.id ?? crypto.randomUUID(),
      clinicId: props.clinicId,
      organizationId: props.organizationId,
      isEnabled: props.isEnabled ?? false,
      provider: props.provider ?? 'ANTHROPIC',
      model: props.model ?? 'claude-haiku-4-5',
      systemPrompt: props.systemPrompt ?? null,
      apiKey: props.apiKey ?? null,
      maxTokens: props.maxTokens ?? null,
      replyOnlyWithinWindow: props.replyOnlyWithinWindow ?? true,
      businessHours: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Yalnız sağlanan (undefined olmayan) alanları günceller; apiKey undefined → korunur. */
  public updateSettings(props: UpdateClinicAiAgentConfigProps): void {
    if (props.isEnabled !== undefined) this._isEnabled = props.isEnabled;
    if (props.provider !== undefined) this._provider = props.provider;
    if (props.model !== undefined) this._model = props.model;
    if (props.systemPrompt !== undefined) {
      this._systemPrompt = props.systemPrompt;
    }
    if (props.apiKey !== undefined) this._apiKey = props.apiKey;
    if (props.maxTokens !== undefined) this._maxTokens = props.maxTokens;
    if (props.replyOnlyWithinWindow !== undefined) {
      this._replyOnlyWithinWindow = props.replyOnlyWithinWindow;
    }
  }

  public enable(): void {
    this._isEnabled = true;
  }

  public disable(): void {
    this._isEnabled = false;
  }

  /** AI yanıt verebilir mi? (etkin + anahtar var ya da platform fallback'i çağıran tarafça karşılanır) */
  public canReply(): boolean {
    return this._isEnabled;
  }

  public toPersistence(): IClinicAiAgentConfig {
    return {
      id: this._id,
      isEnabled: this._isEnabled,
      provider: this._provider,
      model: this._model,
      systemPrompt: this._systemPrompt,
      apiKey: this._apiKey,
      maxTokens: this._maxTokens,
      replyOnlyWithinWindow: this._replyOnlyWithinWindow,
      businessHours: this._businessHours,
      clinicId: this._clinicId,
      organizationId: this._organizationId,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    };
  }
}
