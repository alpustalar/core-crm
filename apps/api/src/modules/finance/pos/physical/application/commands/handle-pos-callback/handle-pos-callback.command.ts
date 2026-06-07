export interface HandlePosCallbackInput {
  externalRef: string;
  rawPayload: unknown;
}

export class HandlePosCallbackCommand {
  constructor(public readonly input: HandlePosCallbackInput) {}
}
