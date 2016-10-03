import { Mapping } from './Mapping';
import { Wetland } from './Wetland';
import { Scope, Entity } from './Scope';
import { EntityInterface } from './EntityInterface';
import { Homefront } from 'homefront';
/**
 * The main entity manager for wetland.
 * This distributes scopes and supplies some core methods.
 */
export declare class EntityManager {
    /**
     * The wetland instance this entity manager belongs to.
     *
     * @type {Wetland}
     */
    private wetland;
    /**
     * Holds the entities registered with the entity manager indexed on name.
     *
     * @type {{}}
     */
    private entities;
    /**
     * Construct a new core entity manager.
     * @constructor
     *
     * @param {Wetland} wetland
     */
    constructor(wetland: Wetland);
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig(): Homefront;
    /**
     * Create a new entity manager scope.
     *
     * @returns {Scope}
     */
    createScope(): Scope;
    /**
     * Get the reference to an entity constructor by name.
     *
     * @param {string} name
     *
     * @returns {Function}
     */
    getEntity(name: string): {
        new ();
    };
    /**
     * Register an entity with the entity manager.
     *
     * @param {EntityInterface} entity
     *
     * @returns {EntityManager}
     */
    registerEntity(entity: EntityInterface): EntityManager;
    /**
     * Get the mapping for provided entity. Can be an instance, constructor or the name of the entity.
     *
     * @param {EntityInterface|string|{}} entity
     *
     * @returns {Mapping}
     */
    getMapping<T>(entity: T): Mapping<T>;
    /**
     * Register multiple entities with the entity manager.
     *
     * @param {EntityInterface[]} entities
     *
     * @returns {EntityManager}
     */
    registerEntities(entities: Array<Function>): EntityManager;
    /**
     * Resolve provided value to an entity reference.
     *
     * @param {EntityInterface|string|{}} hint
     *
     * @returns {EntityInterface|null}
     */
    resolveEntityReference(hint: Entity): {
        new ();
    };
}
