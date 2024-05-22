import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, concatMap, from, Observable, throwError } from 'rxjs';
import { PauseException } from '@app/core/kafka/exceptions/pause.exception';
import { Reflector } from '@nestjs/core';
import { KafkaRateLimitOptions } from '@app/core/kafka/decorators/kafka-rate-limit-options.decorator';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private current = 0;

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { key, limit, pauseDurationMs } = this.reflector.get(
      KafkaRateLimitOptions,
      context.getHandler(),
    );

    return from(
      (async () => {
        if (this.current > limit) {
          throw new Error('limit');
        }
        console.log('locking', key, this.current);
        this.current++;
      })(),
    ).pipe(
      concatMap(() => next.handle()),
      concatMap(() =>
        from(
          (async () => {
            setTimeout(() => {
              this.current--;
              console.log('released', key, this.current);
            }, 10000);
          })(),
        ),
      ),
      catchError((err: Error) => {
        // transform semaphore exception into appropriate RPC error
        if (err.message === 'limit') {
          return throwError(
            () =>
              new PauseException(
                `Reached limit for key=${key}`,
                pauseDurationMs,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
