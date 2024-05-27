import { DynamicModule, Module, Provider } from '@nestjs/common';
import { KafkaModuleOptions } from '@app/core/kafka/interfaces/kafka-module-options.interface';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import kafkaConfig, { KAFKA_CONFIG_KEY } from './config/kafka.config';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { KafkaService } from './services/kafka.service';
import { KAFKA_OPTIONS } from './constants/kafka-options.constant';
import { KAFKA_CLIENT } from './constants/kafka-client.constant';
import { RedisModule } from '@app/core/redis/redis.module';

@Module({})
export class KafkaModule {
  static register(options?: KafkaModuleOptions): DynamicModule {
    const kafkaMicroserviceFactory = {
      provide: KAFKA_CLIENT,
      useFactory: (configService: ConfigService) => {
        const config =
          configService.get<ConfigType<typeof kafkaConfig>>(KAFKA_CONFIG_KEY);
        return ClientProxyFactory.create({
          transport: Transport.KAFKA,
          options: config,
        });
      },
      inject: [ConfigService],
    };
    const topicsProvider: Provider = {
      provide: KAFKA_OPTIONS,
      useValue: options ?? {},
    };
    return {
      module: KafkaModule,
      imports: [
        ClientsModule,
        ConfigModule.forFeature(kafkaConfig),
        RedisModule,
      ],
      providers: [KafkaService, topicsProvider, kafkaMicroserviceFactory],
      exports: [KafkaService, kafkaMicroserviceFactory],
    };
  }
}
