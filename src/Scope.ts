import {UnitOfWork} from './UnitOfWork';
import {EntityManager} from './EntityManager';
import {EntityInterface} from './EntityInterface';
import {EntityRepository} from './EntityRepository';
import {Mapping} from './Mapping';
import {Query} from './Query';
import {Store} from './Store';
import {Wetland} from './Wetland';
import {EntityHydrator} from './EntityHydrator';
import * as knex from 'knex';

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
   * @param {string|Function|Object} entity
   *
   * @returns {EntityRepository}
   */
  public getRepository(entity: string|Function|Object): EntityRepository {
    let entityReference = this.manager.resolveEntityReference(entity);
    let entityMapping   = Mapping.forEntity(entityReference).mapping;
    let Repository      = entityMapping.fetch('entity.repository');

    return new Repository(this, entityReference);
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

    entity.forEach(toRefresh => {
      let primaryKeyName = Mapping.forEntity(toRefresh).getPrimaryKey();
      let primaryKey     = toRefresh[primaryKeyName];
      let refresh        = this.getRepository(toRefresh).getQueryBuilder()
        .where({[primaryKeyName]: primaryKey})
        .limit(1)
        .getQuery()
        .execute()
        .then(freshData => {
          EntityHydrator.fromSchema(freshData[0], toRefresh);
        });

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
   * Create a new Query.
   *
   * @param {{}}                entity
   * @param {string}            alias
   * @param {knex.QueryBuilder} statement
   * @param {string}            [role]
   *
   * @returns {Query}
   */
  public createQuery(entity: Object, alias: string, statement: knex.QueryBuilder, role?: string): Query {
    if (!statement) {
      let connection = this.getStore(entity).getConnection(role || Store.ROLE_SLAVE);

      statement = connection(`${Mapping.forEntity(entity).getEntityName()} as ${alias}`);
    }

    return new Query(statement, this);
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
  public flush(): Promise<any> {
    return this.unitOfWork.commit();
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
