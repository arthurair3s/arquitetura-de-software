export interface IEventPublisher {
  publish(routingKey: string, payload: any): Promise<boolean>;
}
