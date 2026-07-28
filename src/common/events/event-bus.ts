export interface EventBus {
  publish(topic: string, message: any): Promise<void>;
  subscribe(topic: string, handler: (message: any) => Promise<void> | void): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
