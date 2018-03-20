import {Mapping} from '../../../../src/Mapping';
import {ValueObject} from '../ValueObject';

export class TransformUser {
  public name: string;

  static setMapping(mapping: Mapping<TransformUser>) {
    mapping.field('id', {
      type: 'string',
      primary: true,
      hydrate: (value: string): ValueObject => {
        return ValueObject.fromValue(value)
      },
      dehydrate: (value: ValueObject): string => {
        return value.toValue()
      }
    })
    mapping.field('name', {
      type: 'string',
      size: 24,
      hydrate: (value: string): ValueObject => {
        return ValueObject.fromValue(value)
      },
      dehydrate: (value: ValueObject): string => {
        return value.toValue()
      }
    });
  }
}
