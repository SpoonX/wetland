import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Tag } from './tag';
export declare class Image {
    name: string;
    tags: ArrayCollection<Tag>;
    static setMapping(mapping: any): void;
}
