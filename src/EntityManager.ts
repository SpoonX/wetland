import { Mapping } from './Mapping';
import { Wetland } from './Wetland';
import { Entity, Scope } from './Scope';
import { EntityCtor, EntityInterface } from './EntityInterface';
import { Homefront } from 'homefront';
import { EntityRepository } from './EntityRepository';
import { Store } from './Store';

/**
 * The main entity manager for wetland.
 * This distributes scopes and supplies some core methods.
 */
export class EntityManager {

  /**
   * The wetland instance this entity manager belongs to.
   *
   * @type { Wetland }
   */
  private readonly wetland: Wetland = null;

  /**
   * Holds the entities registered with the entity manager indexed on name.
   *
   * @type {{}}
   */
  private entities: { [key: string]: { entity: EntityCtor<EntityInterface>, mapping: Mapping<EntityInterface> } } = {};

  /**
   * Holds instances of repositories that have been instantiated before, as a cache.
   *
   * @type { Map }
   */
  private repositories: Map<EntityCtor<EntityInterface>, EntityRepository<any>> = new Map();

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
  public getEntity(name: string): EntityCtor<EntityInterface> {
    const entity = this.entities[name];

    if (!entity) {
      throw new Error(`No entity found for "${name}".`);
    }

    return entity.entity;
  }

  /**
   * Get a repository instance for the provided Entity reference.
   *
   * @param {string|Entity} entity
   * @param {Scope}         scope
   *
   * @returns {EntityRepository}
   */
  public getRepository<T>(entity: string | EntityCtor<T>, scope?: Scope): EntityRepository<T> {
    const entityReference = this.resolveEntityReference(entity) as EntityCtor<T>;

    if (!this.repositories.has(entityReference) || scope) {
      const entityMapping = Mapping.forEntity(entityReference);
      const Repository = entityMapping.getRepository();

      if (!Repository) {
        throw new Error([
          `Unable to find Repository for entity "${entityMapping.getEntityName() || entityReference.name}".`,
          `Did you forget to register your entity or set entityPath(s)?`,
        ].join(' '));
      }

      if (scope) {
        return new Repository(scope, entityReference);
      }

      this.repositories.set(entityReference, new Repository(this, entityReference));
    }

    return this.repositories.get(entityReference) as EntityRepository<T>;
  }

  /**
   * Get store for provided entity.
   *
   * @param {EntityInterface} entity
   *
   * @returns {Store}
   */
  public getStore(entity?: EntityInterface | string): Store {
    return this.wetland.getStore(this.getStoreName(entity));
  }

  /**
   * Get all registered entities.
   *
   * @returns {{}}
   */
  public getEntities(): { [key: string]: { entity: EntityCtor<EntityInterface>, mapping: Mapping<EntityInterface> } } {
    return this.entities;
  }

  /**
   * Register an entity with the entity manager.
   *
   * @param {EntityInterface} entity
   *
   * @returns {EntityManager}
   */
  public registerEntity<T>(entity: EntityCtor<T> & EntityInterface): EntityManager {
    const mapping = this.getMapping(entity).setEntityManager(this);

    if (typeof entity.setMapping === 'function') {
      entity.setMapping(mapping);
    }

    this.entities[mapping.getEntityName()] = { entity, mapping };

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
    return Mapping.forEntity(this.resolveEntityReference(entity)) as Mapping<T>;
  }

  /**
   * Register multiple entities with the entity manager.
   *
   * @param {EntityInterface[]} entities
   *
   * @returns {EntityManager}
   */
  public registerEntities(entities: Array<EntityCtor<EntityInterface>>): EntityManager {
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
  public resolveEntityReference(hint: Entity): EntityCtor<EntityInterface> {
    if (typeof hint === 'string') {
      return this.getEntity(hint);
    }

    if (typeof hint === 'object') {
      return hint as EntityCtor<EntityInterface>;
    }

    return typeof hint === 'function' ? hint as EntityCtor<EntityInterface> : null;
  }

  private getStoreName(entity?: EntityInterface | string): string {
    if (typeof entity === 'string') {
      return entity;
    }

    if (entity) {
      return this.getMapping(entity).getStoreName();
    }

    return null;
  }
}
