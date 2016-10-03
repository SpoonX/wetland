/// <reference types="chai" />
import { Mapping } from './Mapping';
import { ArrayCollection } from './ArrayCollection';
import { EntityInterface, ProxyInterface } from './EntityInterface';
import { Scope, Entity } from './Scope';
/**
 * Hydrate results into entities.
 */
export declare class Hydrator {
    /**
     * A flat object maintaining a mapping between aliases and recipes.
     *
     * @type {{}}
     */
    private recipeIndex;
    /**
     * The recipe for this hydrator.
     *
     * @type {Recipe}
     */
    private recipe;
    /**
     * Maintain list of hydrated entities.
     *
     * @type {IdentityMap}
     */
    private identityMap;
    /**
     * Reference to the unit of work.
     *
     * @type {UnitOfWork}
     */
    private unitOfWork;
    /**
     * Reference to the entityManager scope.
     *
     * @type {Scope}
     */
    private entityManager;
    /**
     * Construct a new hydrator.
     *
     * @param {Scope} entityManager
     */
    constructor(entityManager: Scope);
    /**
     * Static method to simply map to entities.
     *
     * @param {{}}       values
     * @param {Function} EntityClass
     *
     * @returns {EntityInterface|Function|{new()}}
     */
    fromSchema(values: Object, EntityClass: EntityInterface | Function | {
        new ();
    }): ProxyInterface;
    /**
     * Get a recipe.
     *
     * @param {string}alias
     * @returns {any}
     */
    getRecipe(alias?: any): Recipe;
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
    addRecipe(parent: null | string, alias: string, mapping: Mapping<Entity>, joinType?: string, property?: string): Recipe;
    /**
     * Add columns for hydration to an alias (recipe).
     *
     * @param {string} alias
     * @param {{}}     columns
     *
     * @returns {Hydrator}
     */
    addColumns(alias: string, columns: Object): Hydrator;
    /**
     * Hydrate a collection.
     *
     * @param {[]} rows
     *
     * @returns {ArrayCollection}
     */
    hydrateAll(rows: Array<Object>): ArrayCollection<EntityInterface>;
    /**
     * Hydrate a single result.
     *
     * @param {{}}      row
     * @param {Recipe}  recipe
     *
     * @returns {EntityInterface}
     */
    hydrate(row: Object, recipe: Recipe): ProxyInterface;
    /**
     * Hydrate the joins for a recipe.
     *
     * @param {Recipe}          recipe
     * @param {{}}              row
     * @param {EntityInterface} entity
     */
    private hydrateJoins(recipe, row, entity);
    /**
     * Apply mapping to a new entity.
     *
     * @param {Recipe} recipe
     * @param {{}}     row
     *
     * @returns {EntityInterface}
     */
    private applyMapping(recipe, row);
}
export interface Recipe {
    hydrate: boolean;
    entity: {
        new ();
    };
    primaryKey: {
        alias: string;
        property: string;
    };
    columns: {};
    joins?: {
        [key: string]: Recipe;
    };
    property?: string;
    type?: string;
}
