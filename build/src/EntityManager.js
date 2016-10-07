"use strict";
const Mapping_1 = require('./Mapping');
const Scope_1 = require('./Scope');
/**
 * The main entity manager for wetland.
 * This distributes scopes and supplies some core methods.
 */
class EntityManager {
    /**
     * Construct a new core entity manager.
     * @constructor
     *
     * @param {Wetland} wetland
     */
    constructor(wetland) {
        /**
         * The wetland instance this entity manager belongs to.
         *
         * @type {Wetland}
         */
        this.wetland = null;
        /**
         * Holds the entities registered with the entity manager indexed on name.
         *
         * @type {{}}
         */
        this.entities = {};
        this.wetland = wetland;
    }
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig() {
        return this.wetland.getConfig();
    }
    /**
     * Create a new entity manager scope.
     *
     * @returns {Scope}
     */
    createScope() {
        return new Scope_1.Scope(this, this.wetland);
    }
    /**
     * Get the reference to an entity constructor by name.
     *
     * @param {string} name
     *
     * @returns {Function}
     */
    getEntity(name) {
        let entity = this.entities[name];
        if (!entity) {
            throw new Error(`No entity found for "${name}".`);
        }
        return entity;
    }
    /**
     * Get all registered entities.
     *
     * @returns {{}}
     */
    getEntities() {
        return this.entities;
    }
    /**
     * Register an entity with the entity manager.
     *
     * @param {EntityInterface} entity
     *
     * @returns {EntityManager}
     */
    registerEntity(entity) {
        this.entities[this.getMapping(entity).getEntityName()] = entity;
        if (typeof entity.setMapping === 'function') {
            entity.setMapping(Mapping_1.Mapping.forEntity(this.resolveEntityReference(entity)));
        }
        return this;
    }
    /**
     * Get the mapping for provided entity. Can be an instance, constructor or the name of the entity.
     *
     * @param {EntityInterface|string|{}} entity
     *
     * @returns {Mapping}
     */
    getMapping(entity) {
        return Mapping_1.Mapping.forEntity(this.resolveEntityReference(entity));
    }
    /**
     * Register multiple entities with the entity manager.
     *
     * @param {EntityInterface[]} entities
     *
     * @returns {EntityManager}
     */
    registerEntities(entities) {
        entities.forEach(entity => {
            this.registerEntity(entity);
        });
        return this;
    }
    /**
     * Resolve provided value to an entity reference.
     *
     * @param {EntityInterface|string|{}} hint
     *
     * @returns {EntityInterface|null}
     */
    resolveEntityReference(hint) {
        if (typeof hint === 'string') {
            return this.getEntity(hint);
        }
        if (typeof hint === 'object') {
            return hint.constructor;
        }
        return typeof hint === 'function' ? hint : null;
    }
}
exports.EntityManager = EntityManager;
