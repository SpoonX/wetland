import { User } from './user';
export declare class Tag {
    id: number;
    name: string;
    creator: User;
    static setMapping(mapping: any): void;
}
