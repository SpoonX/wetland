import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Tag } from './tag';
import { Mapping } from '../../../../src/Mapping';
export declare class Category {
    id: number;
    name: string;
    tags: ArrayCollection<Tag>;
    static setMapping(mapping: Mapping<Category>): void;
}
