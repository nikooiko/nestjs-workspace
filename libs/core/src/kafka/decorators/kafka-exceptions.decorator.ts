import { applyDecorators, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';

export function KafkaExceptions() {
  return applyDecorators(UseFilters(AllExceptionsFilter));
}
