import {ValueObject} from "../ValueObject";

export class TransformProfile {
  public id: ValueObject;
  public slogan: ValueObject;

  static setMapping(mapping) {
    mapping.field('id', {
      type: 'string',
      primary: true,
      transformation: {
        hydrate: (value: string): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        }
      }
    })
    mapping.field('slogan', {
      type: 'string',
      size: 24,
      transformation: {
        hydrate: (value: string): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        }
      }
    });
  }
}
