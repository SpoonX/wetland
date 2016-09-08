/// <reference types="chai" />
import { EntityInterface } from './EntityInterface';
export declare class EntityHydrator {
    /**
     * Hydrate a database result into an entity.
     *
     * @param {Object} values
     * @param {{new ()}| Function} EntityClass
     *
     * @returns {EntityInterface}
     */
    static fromSchema(values: Object, EntityClass: EntityInterface | Function | {
        new ();
    }): EntityInterface;
}
