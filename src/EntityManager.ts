import {Mapping} from './Mapping';
import {Wetland} from './Wetland';
import {Scope, Entity} from './Scope';
import {EntityInterface} from './EntityInterface';
import {Homefront} from 'homefront';

/**
 * The main entity manager for wetland.
 * This distributes scopes and supplies some core methods.
 */
export class EntityManager {

  /**
   * The wetland instance this entity manager belongs to.
   *
   * @type {Wetland}
   */
  private wetland: Wetland = null;

  /**
   * Holds the entities registered with the entity manager indexed on name.
   *
   * @type {{}}
   */
  private entities: Object = {};

  /**
   * Construct a new core entity manager.
   * @constructor
   *
   * @param {Wetland} wetland
   */
  public constructor(wetland: Wetland) {
    this.wetland = wetland;
  }

  /**
   * Get the wetland config.
   *
   * @returns {Homefront}
   */
  public getConfig(): Homefront {
    return this.wetland.getConfig();
  }

  /**
   * Create a new entity manager scope.
   *
   * @returns {Scope}
   */
  public createScope(): Scope {
    return new Scope(this, this.wetland);
  }

  /**
   * Get the reference to an entity constructor by name.
   *
   * @param {string} name
   *
   * @returns {Function}
   */
  public getEntity(name: string): {new ()} {
    let entity = this.entities[name];

    if (!entity) {
      throw new Error(`No entity found for "${name}".`);
    }

    return entity;
  }

  /**
   * Register an entity with the entity manager.
   *
   * @param {EntityInterface} entity
   *
   * @returns {EntityManager}
   */
  public registerEntity(entity: EntityInterface): EntityManager {
    this.entities[this.getMapping(entity).getEntityName()] = entity;

    if (typeof entity.setMapping === 'function') {
      entity.setMapping(Mapping.forEntity(this.resolveEntityReference(entity)));
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
  public getMapping<T>(entity: T): Mapping<T> {
    return Mapping.forEntity(this.resolveEntityReference(entity));
  }

  /**
   * Register multiple entities with the entity manager.
   *
   * @param {EntityInterface[]} entities
   *
   * @returns {EntityManager}
   */
  public registerEntities(entities: Array<Function>): EntityManager {
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
  public resolveEntityReference(hint: Entity): {new ()} {
    if (typeof hint === 'string') {
      return this.getEntity(hint);
    }

    if (typeof hint === 'object') {
      return hint.constructor as {new ()};
    }

    return typeof hint === 'function' ? hint as {new ()} : null;
  }
}
