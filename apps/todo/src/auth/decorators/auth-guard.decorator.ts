import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ApiAppUnauthorizedResponse } from '@app/core/error-handling/decorators/api-app-unauthorized-response.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Applies authentication guard that checks whether request has the appropriate logged-in user data.
 */
export function AuthGuard() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiAppUnauthorizedResponse(),
    UseGuards(JwtAuthGuard),
  );
}
