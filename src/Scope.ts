import {UnitOfWork} from './UnitOfWork';
import {EntityManager} from './EntityManager';
import {EntityInterface, ProxyInterface, EntityCtor} from './EntityInterface';
import {EntityRepository} from './EntityRepository';
import {Mapping} from './Mapping';
import {Store} from './Store';
import {Wetland} from './Wetland';
import {Hydrator} from './Hydrator';
import {Homefront} from 'homefront';
import {EntityProxy} from './EntityProxy';

export class Scope {

  /**
   * @type {UnitOfWork}
   */
  private unitOfWork: UnitOfWork;

  /**
   * @type {EntityManager}
   */
  private manager: EntityManager;

  /**
   * @type {Wetland}
   */
  private wetland: Wetland;

  /**
   * Construct a new Scope.
   *
   * @param {EntityManager} manager
   * @param {Wetland}       wetland
   */
  public constructor(manager: EntityManager, wetland: Wetland) {
    this.manager    = manager;
    this.wetland    = wetland;
    this.unitOfWork = new UnitOfWork(this);
  }

  /**
   * Proxy method the entityManager getRepository method.
   *
   * @param {Entity} entity
   *
   * @returns {EntityRepository}
   */
  public getRepository<T>(entity: EntityCtor<T>): EntityRepository<T> {
    let entityReference = this.manager.resolveEntityReference(entity) as EntityCtor<T>;
    let Repository      = Mapping.forEntity(entityReference).getRepository();

    return new Repository(this, entityReference);
  }

  /**
   * Get the wetland config.
   *
   * @returns {Homefront}
   */
  public getConfig(): Homefront {
    return this.manager.getConfig();
  }

  /**
   * Get a reference to a persisted row without actually loading it.
   *
   * @param {Entity} entity
   * @param {*}      primaryKeyValue
   *
   * @returns {EntityInterface}
   */
  public getReference(entity: Entity, primaryKeyValue: any): EntityInterface {
    let ReferenceClass    = this.resolveEntityReference(entity);
    let reference         = new ReferenceClass;
    let primaryKey        = Mapping.forEntity(ReferenceClass).getPrimaryKey();
    reference[primaryKey] = primaryKeyValue;

    // Not super important, but it's a nice-to-have to prevent mutations on the reference as it is stricter.
    this.unitOfWork.registerClean(reference);

    return reference;
  }

  /**
   * Resolve provided value to an entity reference.
   *
   * @param {EntityInterface|string|{}} hint
   *
   * @returns {EntityInterface|null}
   */
  public resolveEntityReference(hint: Entity): {new ()} {
    return this.manager.resolveEntityReference(hint);
  }

  /**
   * Refresh provided entities (sync back from DB).
   *
   * @param {...EntityInterface} entity
   *
   * @returns {Promise<any>}
   */
  public refresh(...entity: Array<EntityInterface>): Promise<any> {
    let refreshes = [];
    let hydrator  = new Hydrator(this);

    entity.forEach(toRefresh => {
      let entityCtor     = this.resolveEntityReference(toRefresh);
      let primaryKeyName = Mapping.forEntity(entityCtor).getPrimaryKey();
      let primaryKey     = toRefresh[primaryKeyName];
      let refresh        = this.getRepository(entityCtor).getQueryBuilder()
        .where({[primaryKeyName]: primaryKey})
        .limit(1)
        .getQuery()
        .execute()
        .then(freshData => hydrator.fromSchema(freshData[0], toRefresh));

      refreshes.push(refresh);
    });

    return Promise.all(refreshes);
  }

  /**
   * Get the reference to an entity constructor by name.
   *
   * @param {string} name
   *
   * @returns {Function}
   */
  public getEntity(name: string): Function {
    return this.manager.getEntity(name);
  }

  /**
   * Get store for provided entity.
   *
   * @param {EntityInterface} entity
   *
   * @returns {Store}
   */
  public getStore(entity: EntityInterface): Store {
    return this.wetland.getStore(this.manager.getMapping(entity).getStoreName());
  }

  /**
   * Get the UnitOfWork.
   *
   * @returns {UnitOfWork}
   */
  public getUnitOfWork(): UnitOfWork {
    return this.unitOfWork;
  }

  /**
   * Get all registered entities.
   *
   * @returns {{}}
   */
  public getEntities(): {[key: string]: EntityCtor<EntityInterface>} {
    return this.manager.getEntities();
  }

  /**
   * Attach an entity (proxy it).
   *
   * @param {EntityInterface} entity
   *
   * @returns {EntityInterface&ProxyInterface}
   */
  public attach<T>(entity: T): T {
    return EntityProxy.patchEntity(entity, this);
  }

  /**
   * Detach an entity (remove proxy, and clear from unit of work).
   *
   * @param {ProxyInterface} entity
   *
   * @returns {EntityInterface}
   */
  public detach(entity: ProxyInterface): EntityInterface {
    entity.deactivateProxying();

    this.unitOfWork.clear(entity);

    return entity.getTarget();
  }

  /**
   * Mark provided entity as new.
   *
   * @param {{}[]} entities
   *
   * @returns {Scope}
   */
  public persist(...entities: Array<Object>): Scope {
    entities.forEach(entity => this.unitOfWork.registerNew(entity));

    return this;
  }

  /**
   * Mark an entity as deleted.
   *
   * @param {{}} entity
   *
   * @returns {Scope}
   */
  public remove(entity: Object): Scope {
    this.unitOfWork.registerDeleted(entity);

    return this;
  }

  /**
   * This method is responsible for persisting the unit of work.
   * This means calculating changes to make, as well as the order to do so.
   * One of the things involved in this is making the distinction between stores.
   *
   * @return {Promise}
   */
  public flush(skipClean: boolean = false): Promise<any> {
    return this.unitOfWork.commit(skipClean);
  }

  /**
   * Clear the unit of work.
   *
   * @returns {Scope}
   */
  public clear(): Scope {
    this.unitOfWork.clear();

    return this;
  }
}

export type Entity = string | {new ()} | EntityInterface;
