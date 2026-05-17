export interface HandleSubscriptionCallbackCommandProps {
  token: string;
  conversationId: string;
}

export class HandleSubscriptionCallbackCommand {
  token: string;
  conversationId: string;

  constructor(props: HandleSubscriptionCallbackCommandProps) {
    Object.assign(this, props);
  }
}
