import {IdentityMap} from './IdentityMap';
import {Mapping} from './Mapping';
import {ArrayCollection} from './ArrayCollection';
import {EntityProxy} from './EntityProxy';
import {UnitOfWork} from './UnitOfWork';
import {EntityInterface, ProxyInterface} from './EntityInterface';
import {Scope, Entity} from './Scope';

export class Hydrator {
  /**
   * A flat object maintaining a mapping between aliases and recipes.
   *
   * @type {{}}
   */
  private recipeIndex: {[key: string]: Recipe} = {};

  /**
   * The recipe for this hydrator.
   *
   * @type {Recipe}
   */
  private recipe: Recipe;

  /**
   * Maintain list of hydrated entities.
   *
   * @type {IdentityMap}
   */
  private identityMap: IdentityMap;

  /**
   * Reference to the unit of work.
   *
   * @type {UnitOfWork}
   */
  private unitOfWork: UnitOfWork;

  /**
   * Reference to the entityManager scope.
   *
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * Construct a new hydrator.
   *
   * @param {Scope} entityManager
   */
  public constructor(entityManager: Scope) {
    this.unitOfWork    = entityManager.getUnitOfWork();
    this.entityManager = entityManager;
    this.identityMap   = entityManager.getIdentityMap();
  }

  /**
   * Static method to simply map to entities.
   *
   * @param {{}}       values
   * @param {Function} EntityClass
   *
   * @returns {EntityInterface|Function|{new()}}
   */
  public fromSchema(values: Object, EntityClass: EntityInterface | Function | {new ()}): ProxyInterface {
    let mapping = Mapping.forEntity(EntityClass);
    let entity  = typeof EntityClass === 'function' ? new (EntityClass as {new ()}) : EntityClass;
    entity      = EntityProxy.patchEntity(entity as EntityInterface, this.entityManager);

    Object.getOwnPropertyNames(values).forEach(column => {
      let property = mapping.getPropertyName(column);

      if (!property) {
        return;
      }

      entity[property] = {_skipDirty: values[column]};
    });

    return entity;
  }

  /**
   * Get a recipe.
   *
   * @param {string}alias
   * @returns {any}
   */
  public getRecipe(alias?): Recipe {
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
  public addRecipe(parent: null | string, alias: string, mapping: Mapping<Entity>, joinType?: string, property?: string): Recipe {
    let primaryKey        = mapping.getPrimaryKey();
    let primaryKeyAliased = `${alias}.${primaryKey}`;
    let recipe            = {
      hydrate   : false,
      parent    : null,
      entity    : mapping.getTarget(),
      primaryKey: {alias: primaryKeyAliased, property: primaryKey},
      type      : joinType,
      columns   : {},
      property,
      alias,
    };

    this.recipeIndex[alias] = recipe;

    if (parent) {
      let parentRecipe          = this.recipeIndex[parent];
      parentRecipe.joins        = parentRecipe.joins || {};
      parentRecipe.joins[alias] = recipe;
    } else {
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
  public addColumns(alias: string, columns: Object): Hydrator {
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
  public hydrateAll(rows: Array<Object>): ArrayCollection<EntityInterface> {
    let entities = new ArrayCollection;

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
  public hydrate(row: Object, recipe: Recipe): ProxyInterface {
    if (!recipe.hydrate) {
      return null;
    }

    let entity = this.identityMap.fetch(recipe.entity, row[recipe.primaryKey.alias]) as ProxyInterface;

    if (!entity) {
      entity = this.applyMapping(recipe, row);

      if (!entity) {
        return null;
      }
    }

    if (recipe.parent) {
      // Assign self to parent (only for many).
      recipe.parent.entities[row[recipe.parent.column]][recipe.parent.property].add({_skipDirty: entity});
    }

    if (recipe.joins) {
      this.hydrateJoins(recipe, row, entity);
    }

    entity.activateProxying();

    return entity;
  }

  /**
   * Clear a catalogue for `alias`.
   *
   * @param {string} [alias]
   *
   * @returns {Hydrator}
   */
  public clearCatalogue(alias?: string): this {
    let recipe = this.getRecipe(alias);

    delete recipe.catalogue;

    return this;
  }

  /**
   * Hydrate the joins for a recipe.
   *
   * @param {Recipe}          recipe
   * @param {{}}              row
   * @param {EntityInterface} entity
   */
  private hydrateJoins(recipe: Recipe, row: Object, entity: ProxyInterface): void {
    Object.getOwnPropertyNames(recipe.joins).forEach(alias => {
      let joinRecipe = recipe.joins[alias];
      let hydrated   = this.hydrate(row, joinRecipe);

      if (!joinRecipe.hydrate) {
        return;
      }

      if (joinRecipe.type === 'single') {
        entity[joinRecipe.property] = {_skipDirty: hydrated};

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
   * Add entity to catalogue.
   *
   * @param {Recipe}         recipe
   * @param {ProxyInterface} entity
   *
   * @returns {Hydrator}
   */
  private addToCatalogue(recipe: Recipe, entity: ProxyInterface): this {
    let primary                 = entity[recipe.primaryKey.property];
    let catalogue               = this.getCatalogue(recipe.alias);
    catalogue.entities[primary] = entity;

    catalogue.primaries.add(primary);

    return this;
  }

  /**
   * Enable catalogue for alias.
   *
   * @param {string} alias
   *
   * @returns {Catalogue}
   */
  public enableCatalogue(alias: string): Catalogue {
    return this.getCatalogue(alias);
  }

  /**
   * Check if catalogue exists for alias.
   *
   * @param {string} alias
   *
   * @returns {boolean}
   */
  public hasCatalogue(alias: string): boolean {
    return !!this.getRecipe(alias).catalogue;
  }

  /**
   * Get the catalogue for alias.
   *
   * @param {string} alias
   *
   * @returns {Catalogue}
   */
  public getCatalogue(alias: string): Catalogue {
    let recipe       = this.getRecipe(alias);
    recipe.catalogue = recipe.catalogue || {entities: {}, primaries: new ArrayCollection()};

    return recipe.catalogue;
  }

  /**
   * Apply mapping to a new entity.
   *
   * @param {Recipe} recipe
   * @param {{}}     row
   *
   * @returns {EntityInterface}
   */
  private applyMapping(recipe: Recipe, row: Object): ProxyInterface {
    if (!row[recipe.primaryKey.alias]) {
      return null;
    }

    let entity                         = new recipe.entity;
    entity[recipe.primaryKey.property] = row[recipe.primaryKey.alias];

    Object.getOwnPropertyNames(recipe.columns).forEach(alias => {
      entity[recipe.columns[alias]] = row[alias];
    });

    this.unitOfWork.registerClean(entity, true);

    let patched = EntityProxy.patchEntity(entity, this.entityManager);

    this.identityMap.register(entity, patched);

    if (recipe.catalogue) {
      this.addToCatalogue(recipe, patched);
    }

    return patched;
  }
}

export interface Catalogue {
  entities: Object,
  primaries: ArrayCollection<string|number>
}

export interface Recipe {
  hydrate: boolean,
  alias: string,
  entity: {new ()},
  primaryKey: {alias: string, property: string},
  columns: {},
  catalogue?: Catalogue,
  parent?: {property: string, column: string, entities: Object},
  joins?: {[key: string]: Recipe},
  property?: string,
  type?: string,
}
