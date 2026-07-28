import { RedisEventBus } from "./redis-event-bus";
import { EventBus } from "./event-bus";

// In a real application, you could use a factory pattern or dependency injection
// to return a KafkaEventBus if a specific environment variable is set.
// For now, we instantiate the RedisEventBus.
export const eventBus: EventBus = new RedisEventBus();
