import winston from 'winston';
import { TransformableInfo } from 'logform';
import { errorFields } from '../constants/error-fields.constant';

/**
 * This formatter extracts "message" and "stack" from incoming errors, saves the latter under "trace" metadata field
 * and replaces the original error field with its "message". Does nothing if originally the metadata already contain
 * a "stack" field.
 * @param {TransformableInfo} info
 * @returns {TransformableInfo}
 */
export const errorStackFormatter = winston.format(
  (info: TransformableInfo): TransformableInfo => {
    // we are only interested in error logs at this formatter.
    if (info.level !== 'error') {
      return info;
    }
    // do nothing if metadata already contain a 'stack' field.
    if (info.stack) {
      return info;
    }
    // now, that we are sure that the metadata don't have a stack, we can try extract it from the errorFields.
    const errorField = errorFields.find((field) => info[field]) || 'error';
    const error = info[errorField];
    if (!error?.stack) {
      return info;
    }
    // error contains stack, so split it into two different fields
    info[errorField] = error.message;
    info.stack = error.stack;
    return info;
  },
);
