import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function MaxPage(max: number, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'maxPage',
      target: object.constructor,
      propertyName,
      constraints: [max],
      options: validationOptions,
      validator: {
        validate(page: any, args: ValidationArguments) {
          const [maxValue] = args.constraints;
          const { limit } = args.object as any;
          return (
            typeof page === 'number' &&
            typeof limit === 'number' &&
            page * limit <= maxValue
          );
        },
      },
    });
  };
}
