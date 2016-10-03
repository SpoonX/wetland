"use strict";
const IdentityMap_1 = require('./IdentityMap');
const Mapping_1 = require('./Mapping');
const ArrayCollection_1 = require('./ArrayCollection');
const EntityProxy_1 = require('./EntityProxy');
/**
 * Hydrate results into entities.
 */
class Hydrator {
    /**
     * Construct a new hydrator.
     *
     * @param {Scope} entityManager
     */
    constructor(entityManager) {
        /**
         * A flat object maintaining a mapping between aliases and recipes.
         *
         * @type {{}}
         */
        this.recipeIndex = {};
        /**
         * Maintain list of hydrated entities.
         *
         * @type {IdentityMap}
         */
        this.identityMap = new IdentityMap_1.IdentityMap;
        this.unitOfWork = entityManager.getUnitOfWork();
        this.entityManager = entityManager;
    }
    /**
     * Static method to simply map to entities.
     *
     * @param {{}}       values
     * @param {Function} EntityClass
     *
     * @returns {EntityInterface|Function|{new()}}
     */
    fromSchema(values, EntityClass) {
        let mapping = Mapping_1.Mapping.forEntity(EntityClass);
        let entity = typeof EntityClass === 'function' ? new EntityClass : EntityClass;
        entity = EntityProxy_1.EntityProxy.patchEntity(entity, this.entityManager);
        Object.getOwnPropertyNames(values).forEach(column => {
            let property = mapping.getPropertyName(column);
            if (!property) {
                return;
            }
            entity[property] = { _skipDirty: values[column] };
        });
        return entity;
    }
    /**
     * Get a recipe.
     *
     * @param {string}alias
     * @returns {any}
     */
    getRecipe(alias) {
        if (alias) {
            return this.recipeIndex[alias];
        }
        return this.recipe;
    }
    /**
     * Add a recipe to the hydrator.
     *
     * @param {string|null} parent      String for parent alias, null when root.
     * @param {string}      alias       The alias used for the entity.
     * @param {Mapping}     mapping     Mapping for the entity.
     * @param {string}      [joinType]  Type of join (single, collection)
     * @param {string}      [property]  The name of the property on the parent.
     *
     * @returns {Recipe}
     */
    addRecipe(parent, alias, mapping, joinType, property) {
        let primaryKey = mapping.getPrimaryKey();
        let primaryKeyAliased = `${alias}.${primaryKey}`;
        let recipe = {
            hydrate: false,
            entity: mapping.getTarget(),
            primaryKey: { alias: primaryKeyAliased, property: primaryKey },
            property: property,
            type: joinType,
            columns: {},
        };
        this.recipeIndex[alias] = recipe;
        if (parent) {
            let parentRecipe = this.recipeIndex[parent];
            parentRecipe.joins = parentRecipe.joins || {};
            parentRecipe.joins[alias] = recipe;
        }
        else {
            this.recipe = recipe;
        }
        return recipe;
    }
    /**
     * Add columns for hydration to an alias (recipe).
     *
     * @param {string} alias
     * @param {{}}     columns
     *
     * @returns {Hydrator}
     */
    addColumns(alias, columns) {
        Object.assign(this.recipeIndex[alias].columns, columns);
        return this;
    }
    /**
     * Hydrate a collection.
     *
     * @param {[]} rows
     *
     * @returns {ArrayCollection}
     */
    hydrateAll(rows) {
        let entities = new ArrayCollection_1.ArrayCollection;
        rows.forEach(row => {
            let hydrated = this.hydrate(row, this.recipe);
            if (hydrated) {
                entities.add(hydrated);
            }
        });
        return entities;
    }
    /**
     * Hydrate a single result.
     *
     * @param {{}}      row
     * @param {Recipe}  recipe
     *
     * @returns {EntityInterface}
     */
    hydrate(row, recipe) {
        if (!recipe.hydrate) {
            return null;
        }
        let entity = this.identityMap.fetch(recipe.entity, row[recipe.primaryKey.alias]);
        if (!entity) {
            entity = this.applyMapping(recipe, row);
            if (!entity) {
                return null;
            }
        }
        if (recipe.joins) {
            this.hydrateJoins(recipe, row, entity);
        }
        this.unitOfWork.registerClean(entity);
        entity.activateProxying();
        return entity;
    }
    /**
     * Hydrate the joins for a recipe.
     *
     * @param {Recipe}          recipe
     * @param {{}}              row
     * @param {EntityInterface} entity
     */
    hydrateJoins(recipe, row, entity) {
        Object.getOwnPropertyNames(recipe.joins).forEach(alias => {
            let joinRecipe = recipe.joins[alias];
            let hydrated = this.hydrate(row, joinRecipe);
            if (joinRecipe.type === 'single') {
                entity[joinRecipe.property] = { _skipDirty: hydrated };
                return;
            }
            // If not hydrated, at least set null value on property (above)
            if (!hydrated) {
                return;
            }
            entity[joinRecipe.property].add(hydrated);
        });
    }
    /**
     * Apply mapping to a new entity.
     *
     * @param {Recipe} recipe
     * @param {{}}     row
     *
     * @returns {EntityInterface}
     */
    applyMapping(recipe, row) {
        if (!row[recipe.primaryKey.alias]) {
            return null;
        }
        let entity = new recipe.entity;
        entity[recipe.primaryKey.property] = row[recipe.primaryKey.alias];
        Object.getOwnPropertyNames(recipe.columns).forEach(alias => {
            let property = recipe.columns[alias];
            entity[property] = row[alias];
        });
        this.unitOfWork.registerClean(entity, true);
        let patched = EntityProxy_1.EntityProxy.patchEntity(entity, this.entityManager);
        this.identityMap.register(entity, patched);
        return patched;
    }
}
exports.Hydrator = Hydrator;
