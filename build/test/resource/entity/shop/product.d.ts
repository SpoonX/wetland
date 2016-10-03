import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Category } from './category';
import { User } from './user';
import { Image } from './image';
export declare class Product {
    categories: ArrayCollection<Category>;
    name: string;
    image: Image;
    author: User;
    static setMapping(mapping: any): void;
}
