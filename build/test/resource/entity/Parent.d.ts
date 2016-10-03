import { ArrayCollection } from '../../../src/ArrayCollection';
import { Simple } from './Simple';
export declare class Parent {
    name: string;
    simples: ArrayCollection<Simple>;
    others: ArrayCollection<Simple>;
    single: Simple;
    static setMapping(mapping: any): void;
}
