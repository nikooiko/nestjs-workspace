import { registerAs } from '@nestjs/config';
import { KafkaOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';

export const KAFKA_CONFIG_KEY = 'kafka';

export default registerAs(
  KAFKA_CONFIG_KEY,
  (): NonNullable<KafkaOptions['options']> => ({
    client: {
      brokers: (process.env.KAFKA_BROKER_LIST || 'localhost:9092').split(','),
    },
  }),
);
