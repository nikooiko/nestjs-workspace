import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { Logger } from 'winston';
import { ClientKafka } from '@nestjs/microservices';
import { LOGGER } from '../../logger/factories/logger.factory';
import { KafkaModuleOptions } from '../interfaces/kafka-module-options.interface';
import { KAFKA_OPTIONS } from '../constants/kafka-options.constant';
import { KAFKA_CLIENT } from '@app/core/kafka/constants/kafka-client.constant';

@Injectable()
export class KafkaService implements OnApplicationBootstrap, OnModuleDestroy {
  public allowedProduceTopics: string[];

  constructor(
    @Inject(KAFKA_OPTIONS) private options: KafkaModuleOptions,
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka,
  ) {
    this.allowedProduceTopics = this.options.allowedProduceTopics || [];
  }

  async onApplicationBootstrap() {
    this.logger.info('Connecting to Kafka broker', {
      type: 'KAFKA_CONNECTING',
    });
    await this.kafkaClient.connect();
    this.logger.info(`Connected to Kafka broker`, {
      type: 'KAFKA_CONNECTED',
    });
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.info(`Closing connection to Kafka broker`, {
      type: 'KAFKA_CLOSING_CONNECTION',
    });
  }

  // This could also take the key option, to ensure ordering of messages
  async emitMessage<T>({
    topic,
    message,
    key,
  }: {
    topic: string;
    message: any;
    key?: string;
  }) {
    if (!this.allowedProduceTopics.includes(topic)) {
      throw new Error(`Producing messages to topic "${topic}" is not allowed.`);
    }
    const payload = key ? { key, value: message } : message;
    this.logger.debug(`Emitting message to topic "${topic}"`, {
      type: 'KAFKA_EMIT_MSG',
      payload,
    });
    return this.kafkaClient.emit<T>(topic, payload);
  }
}
