import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiAppUnauthorizedResponse } from '@app/core/api/decorators/api-app-unauthorized-response.decorator';

/**
 * Applies authentication guard that checks whether request has the appropriate logged-in user data.
 */
export function AuthGuard() {
  return applyDecorators(ApiAppUnauthorizedResponse(), UseGuards(JwtAuthGuard));
}
