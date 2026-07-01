export interface DomainEvent {
  type: string;
  aggregateId: string;
  occurredAt: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  traceId?: string;
  version?: number;
  retryCount?: number;
}

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

export interface EventSubscriber {
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void> | void): void;
}

export interface EventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
}

export interface EventStore {
  append(event: DomainEvent): Promise<void>;
  load(aggregateId: string): Promise<DomainEvent[]>;
}

export interface Outbox {
  enqueue(event: DomainEvent): Promise<void>;
  drain(): Promise<DomainEvent[]>;
}

export const createInMemoryEventDispatcher = (): EventDispatcher & EventSubscriber => {
  const handlers = new Map<string, Array<(event: DomainEvent) => Promise<void> | void>>();

  return {
    async dispatch(event) {
      const subscribers = handlers.get(event.type) ?? [];
      await Promise.all(subscribers.map((handler) => handler(event)));
    },
    subscribe(eventType, handler) {
      const list = handlers.get(eventType) ?? [];
      list.push(handler);
      handlers.set(eventType, list);
    },
  };
};

export const createDomainEvent = (overrides: Partial<DomainEvent> & Pick<DomainEvent, 'type' | 'aggregateId'>): DomainEvent => ({
  occurredAt: new Date().toISOString(),
  version: 1,
  retryCount: 0,
  ...overrides,
});
