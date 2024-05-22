import { RpcException } from '@nestjs/microservices';

export class PauseException extends RpcException {
  constructor(err: string | object, public pauseDurationMs: number) {
    super(err);
  }
}
