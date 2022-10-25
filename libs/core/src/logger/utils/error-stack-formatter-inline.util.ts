import winston from 'winston';
import { TransformableInfo } from 'logform';
import { errorFields } from '../constants/error-fields.constant';

/**
 * This formatter tries to find a stack trace, by looking into known error fields and if finds one it appends it to the
 * message and removes the original metadata field.
 * @param {TransformableInfo} info
 * @returns {TransformableInfo}
 */
export const errorStackFormatterInline = winston.format(
  (info: TransformableInfo): TransformableInfo => {
    // we are only interested in error logs at this formatter.
    if (info.level !== 'error') {
      return info;
    }
    const errorField = errorFields.find((field) => info[field]) || 'stack';
    const error = info[errorField];
    const stack = info.stack || error?.stack;
    if (error?.message) {
      delete info[errorField]; // delete this field from metadata, for prettier logs
      // it was a traditional error so keep its message also
      info.message += `: ${error.message}`;
    }
    if (stack) {
      delete info.stack; // delete this field from metadata, for prettier logs
      info.message += `\n${stack}\n`;
    }
    return info;
  },
);
