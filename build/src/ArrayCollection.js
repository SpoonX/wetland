"use strict";
/**
 * Represents Array collections.
 */
class ArrayCollection extends Array {
    /**
     * Add items to the collection when not already in the collection.
     *
     * @param {...*} items
     *
     * @returns this Fluent interface
     */
    add(...items) {
        items.forEach(item => {
            if (!this.includes(item)) {
                this.push(item);
            }
        });
        return this;
    }
    /**
     * Remove items from the collection when part of the collection.
     *
     * @param {...*} items
     *
     * @returns this Fluent interface
     */
    remove(...items) {
        items.forEach(item => {
            let itemIndex = this.indexOf(item);
            if (itemIndex > -1) {
                this.splice(itemIndex, 1);
            }
        });
        return this;
    }
}
exports.ArrayCollection = ArrayCollection;
