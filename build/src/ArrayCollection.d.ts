/**
 * Represents Array collections.
 */
export declare class ArrayCollection extends Array {
    /**
     * Add items to the collection when not already in the collection.
     *
     * @param {...*} items
     *
     * @returns this Fluent interface
     */
    add(...items: Array<any>): ArrayCollection;
    /**
     * Remove items from the collection when part of the collection.
     *
     * @param {...*} items
     *
     * @returns this Fluent interface
     */
    remove(...items: Array<any>): ArrayCollection;
}
