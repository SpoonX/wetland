import {Mapping} from '../../../../src/Mapping';
import {ValueObject} from '../ValueObject';
import {TransformList} from './TransformList';
import {TransformUser} from './TransformUser';

export class TransformTodo {
  static setMapping(mapping: Mapping<TransformTodo>) {
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
    mapping.field('task', {
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
        hydrate: (value: boolean): ValueObject => {
          return ValueObject.fromValue(value)
        },
        dehydrate: (value: ValueObject): boolean => {
          return value.toValue()
        }
      }
    });

    mapping.manyToOne('list', {targetEntity: TransformList, inversedBy: 'todos'});
    mapping.oneToOne('creator', {targetEntity: TransformUser});
  }
}
