import {ValueObject} from '../ValueObject';
import {TransformTodo} from './TransformTodo';

export class TransformList {
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
    mapping.field('name', {
      type: 'string',
      transformation: {
        hydrate: (value: string): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        }
      }
    });
    mapping.field('done', {
      type: 'boolean', nullable: true,
      transformation: {
        hydrate: (value: string): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        }
      }
    });

    mapping.forProperty('todos')
      .oneToMany({targetEntity: TransformTodo, mappedBy: 'list'})
      .cascade(['persist', 'remove']);
  }
}
