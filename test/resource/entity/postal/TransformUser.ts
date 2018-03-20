import {Mapping} from '../../../../src/Mapping';
import {ArrayCollection} from '../../../../src/ArrayCollection';
import {Tracker} from './Tracker';
import {ValueObject} from '../ValueObject';

export class TransformUser {
  public id: number;

  public name: ValueObject;

  public trackers: ArrayCollection<Tracker> = new ArrayCollection();

  public static setMapping(mapping: Mapping<TransformUser>) {
    mapping.forProperty('id').primary().increments();
    mapping.field('name', {
      type: 'string',
      transformation: {
        dehydrate: (value: ValueObject): string => {
          return value.toValue()
        },
        hydrate: (value: string): ValueObject =>  {
          return ValueObject.fromValue(value)
        }
      }
    });
    mapping.forProperty('trackers').cascade(['persist']).manyToMany({targetEntity: Tracker, mappedBy: 'observers'});
  }
}
