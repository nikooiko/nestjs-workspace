import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

/**
 * This guard is used to prevent brute force attacks on the API. Handles both behind proxy and without proxy flows.
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    return req.ips?.length ? req.ips[0] : req.ip;
  }
}
