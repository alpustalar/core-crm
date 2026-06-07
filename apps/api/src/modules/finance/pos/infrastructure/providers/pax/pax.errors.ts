export class PaxConnectionError extends Error {
  readonly cause?: Error;
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'PaxConnectionError';
    this.cause = cause;
  }
}

export class PaxTimeoutError extends Error {
  constructor(readonly durationMs: number) {
    super(
      `PAX işlem zaman aşımına uğradı (${durationMs}ms). İşlem beklemede kaldı, manuel reconcile gerekebilir.`
    );
    this.name = 'PaxTimeoutError';
  }
}

export class PaxProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaxProtocolError';
  }
}
