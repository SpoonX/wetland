"use strict";
const homefront_1 = require('homefront');
class MetaData {
    /**
     * Get metadata for provided target (uses constructor).
     *
     * @param {function|{}} target
     *
     * @returns {Homefront}
     */
    static forTarget(target) {
        return MetaData.ensure(MetaData.getConstructor(target));
    }
    /**
     * Ensure metadata for provided target.
     *
     * @param {*} target
     *
     * @returns {Homefront}
     */
    static ensure(target) {
        if (!MetaData.metaMap.has(target)) {
            MetaData.metaMap.set(target, new homefront_1.Homefront());
        }
        return MetaData.metaMap.get(target);
    }
    /**
     * Get metadata for provided target (accepts instance).
     *
     * @param {ProxyInterface} instance
     *
     * @returns {Homefront}
     */
    static forInstance(instance) {
        if (typeof instance !== 'object') {
            throw new Error("Can't get metadata, provided instance isn't of type Object.");
        }
        return MetaData.ensure(instance.isEntityProxy ? instance.getTarget() : instance);
    }
    /**
     * Get the constructor for provided target.
     *
     * @param {function|{}} target
     *
     * @returns {Function}
     */
    static getConstructor(target) {
        return (typeof target === 'function' ? target : target.constructor);
    }
}
/**
 * Static weakmap of objects their metadata.
 *
 * @type {WeakMap<Object, Homefront>}
 */
MetaData.metaMap = new WeakMap();
exports.MetaData = MetaData;
