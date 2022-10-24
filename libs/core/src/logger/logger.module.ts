import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import loggerConfig from './config/logger.config';
import { NestJSLoggerService } from './services/nestjs-logger.service';
import { LOGGER, loggerFactory } from './factories/logger.factory';
import { LogHttp } from './middleware/log-http.middleware';

/**
 * This module introduces 2 different loggers that play on top of winston, one for the application logic
 * (@Inject(LOGGER) private logger: Logger), and one for core NestJS modules (NestJSLoggerService).
 *
 * You can find the current winston settings under `config/logger.config.ts` and change the logger behavior with
 * environment variables:
 *   - NODE_ENV:
 *     - 'production' => json output for easier searches using your logging system (e.g. Azure Log Analytic Workspace).
 *     - any other => NestJS-like console output.
 *   - LOGGER_MIN_LEVEL: The desired minimum log level.
 *   - LOGGER_DISABLE: By setting to 'true', you can disable logs entirely.
 *   - SERVICE_NAME: The 'service' metadata field default value.
 *   - LOGGER_HTTP_BODY_ENABLED: By setting to 'true', you can enable http logs to include the 'body' field of the req.
 *   - LOGGER_HTTP_BODY_MAX_SIZE: The maximum allowed 'body' size that will be logged (this is used to prevent the
 *       system to log very large set of data).
 *   - LOGGER_HTTP_QUERY_ENABLED: By setting to 'true', you can enable http logs to include the 'query' field of the req.
 *   - LOGGER_HTTP_QUERY_MAX_SIZE: The maximum allowed 'query' size that will be logged (this is used to prevent the
 *       system to log very large set of data).
 *   - LOGGER_HTTP_COOKIES_ENABLED: By setting to 'true', you can enable http logs to include the 'cookies' field of the
 *       req.
 *   - LOGGER_HTTP_COOKIES_MAX_SIZE: The maximum allowed 'cookies' size that will be logged (this is used to prevent the
 *       system to log very large set of data).
 *
 *
 * For better logs, this logger module expects some provided meta key/values:
 *   - 'layer':   Indicates whether the log comes from a specific logic layer (e.g. 'Nest' => internal NestJS system).
 *                By default, is set to 'App' for the application logger and to 'Nest' for the NestJS logger.
 *   - 'service': The name of the service that outputs these logs (useful when using this module on multiple microservices).
 *                Can be set via an environment variable (SERVICE_NAME).
 *   - 'context': The context of the log. By default, the context is the constructor name of the parent class.
 *   - 'type':    This is a unique identifier that the callee can pass (as best practice), in order to be able to query
 *                the collection of logs and find the desired location in the code
 *                (e.g. `logger.info('Random log', { type: 'RANDOM_LOG' })`).
 *
 * Note-1: You must configure the application to use the newly introduced NestJSLoggerService if you want the
 *       internal NestJS modules (and the bootstrap process), to log in the same format as the rest of your system.
 *
 *       Example:
 *
 *       ```js
 *       const app = await NestFactory.create(AppModule, {
 *         bufferLogs: true,
 *       });
 *       app.useLogger(app.get(NestJSLoggerService));
 *       ```
 * Note-2: Your application modules should use LOGGER and not NestJSLoggerService, as the first one provides the
 *         winston interface (which is easier for passing metadata), while the latter provides the default NestJS
 *         logger interface.
 */

@Global()
@Module({
  imports: [ConfigModule.forFeature(loggerConfig)],
  providers: [loggerFactory, NestJSLoggerService],
  exports: [LOGGER, NestJSLoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LogHttp).forRoutes('*');
  }
}
