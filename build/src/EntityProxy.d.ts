import { ProxyInterface } from './EntityInterface';
import { Scope } from './Scope';
export declare class EntityProxy {
    /**
     * Patch provided entity with a proxy to track changes.
     *
     * @param {EntityInterface} entity
     * @param {Scope}           entityManager
     *
     * @returns {Object}
     */
    static patchEntity<T>(entity: T, entityManager: Scope): T & ProxyInterface;
}
