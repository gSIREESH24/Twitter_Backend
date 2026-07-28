import { KafkaEventBus } from "./kafka-event-bus";
import { EventBus } from "./event-bus";

// We have migrated from RedisEventBus to KafkaEventBus
export const eventBus: EventBus = new KafkaEventBus();
