import {
  ValidateIf,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

type Operator = '<' | '<=' | '>' | '>=' | '===' | '!==' | '==' | '!=';

const comparisonOperators: Record<Operator, (a: number, b: number) => boolean> =
  {
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '===': (a, b) => a === b,
    '!==': (a, b) => a !== b,
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
  };

@ValidatorConstraint({ name: 'dynamicComparison', async: false })
export class DynamicComparisonConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [COMPARED_WITH_FIELD, OPERATOR] = args.constraints;
    const relatedValue = (args.object as any)[COMPARED_WITH_FIELD];

    if (relatedValue === undefined || value === undefined) return true;

    const compareFn = comparisonOperators[OPERATOR];
    return compareFn ? compareFn(value, relatedValue) : false;
  }

  defaultMessage(args: ValidationArguments) {
    const [COMPARED_WITH_FIELD, OPERATOR, FIRST_FIELD_NAME, SECOND_FIELD_NAME] =
      args.constraints;
    return i18nValidationMessage('validation.INVALID_COMPARISON', {
      FIRST_FIELD_NAME,
      OPERATOR,
      SECOND_FIELD_NAME,
    })(args);
  }
}

// Decorator function
export function CompareWith(
  relatedProperty: string,
  OPERATOR: Operator,
  FIRST_FIELD_NAME?: string,
  SECOND_FIELD_NAME?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [
        relatedProperty,
        OPERATOR,
        FIRST_FIELD_NAME,
        SECOND_FIELD_NAME,
      ],
      validator: DynamicComparisonConstraint,
    });
  };
}
