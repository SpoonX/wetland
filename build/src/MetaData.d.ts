/// <reference types="chai" />
import { Homefront } from 'homefront';
export declare class MetaData {
    /**
     * Static weakmap of objects their metadata.
     *
     * @type {WeakMap<Object, Homefront>}
     */
    private static metaMap;
    /**
     * Get metadata for provided target (uses constructor).
     *
     * @param {function|{}} target
     *
     * @returns {Homefront}
     */
    static forTarget(target: Function | Object): Homefront;
    /**
     * Ensure metadata for provided target.
     *
     * @param {*} target
     *
     * @returns {Homefront}
     */
    static ensure(target: any): Homefront;
    /**
     * Get metadata for provided target (accepts instance).
     *
     * @param {{}} instance
     *
     * @returns {Homefront}
     */
    static forInstance(instance: Object): Homefront;
    /**
     * Get the constructor for provided target.
     *
     * @param {function|{}} target
     *
     * @returns {Function}
     */
    static getConstructor(target: Function | Object): Function;
}
