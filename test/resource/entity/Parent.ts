import { ArrayCollection } from '../../../src/ArrayCollection';
import { Simple } from './Simple';

export class Parent {
  public name: string;

  public simples: ArrayCollection<Simple> = new ArrayCollection();

  public others: ArrayCollection<Simple> = new ArrayCollection();

  public single: Simple;

  public static setMapping(mapping) {
    mapping.oneToMany('simples', { targetEntity: Simple, mappedBy: 'parent' });
    mapping.oneToOne('single', { targetEntity: Simple });
  }
}
