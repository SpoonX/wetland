/// <reference types="chai" />
import { UnitOfWork } from './UnitOfWork';
import { EntityInterface } from './EntityInterface';
export declare class EntityProxy {
    /**
     * Patch provided entity with a proxy to track changes.
     *
     * @param {EntityInterface} entity
     * @param {UnitOfWork}      unitOfWork
     *
     * @returns {Object}
     */
    static patch(entity: EntityInterface, unitOfWork: UnitOfWork): Object;
}
