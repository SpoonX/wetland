import {ArrayCollection} from './ArrayCollection';
import {Store} from './Store';
import {EntityInterface} from './EntityInterface';
import {Mapping} from './Mapping';
import {Scope} from './Scope';
import {QueryBuilder} from './QueryBuilder';
import {MetaData} from './MetaData';

/**
 * Maintains a list of objects affected by a business transaction and -
 *  coordinates the writing out of changes and the resolution of concurrency problems.
 *
 * @export
 * @class UnitOfWork
 */
export class UnitOfWork {

  public static STATE_CLEAN: string = 'clean';

  public static STATE_DIRTY: string = 'dirty';

  public static STATE_NEW: string = 'new';

  public static STATE_DELETED: string = 'deleted';

  /**
   * Holds a list of objects that have been marked as being "dirty".
   *
   * @type {ArrayCollection}
   */
  private dirtyObjects: ArrayCollection;

  /**
   * Holds a list of objects that have been marked as being "new".
   *
   * @type {ArrayCollection}
   */
  private newObjects: ArrayCollection;

  /**
   * Holds a list of objects that have been marked as being "deleted".
   *
   * @type {ArrayCollection}
   */
  private deletedObjects: ArrayCollection;

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {{}|null}
   */
  private transactions: Object;

  /**
   * Create a new UnitOfWork.
   *
   * @param {Scope} entityManager
   */
  public constructor(entityManager: Scope) {
    this.entityManager = entityManager;

    this.clear();
  }

  /**
   * Register an object as "new".
   *
   * @param {Object} newObject
   *
   * @returns {UnitOfWork} Fluent interface
   */
  public registerNew(newObject: Object): UnitOfWork {
    this.deletedObjects.remove(newObject);
    this.dirtyObjects.remove(newObject);
    this.newObjects.add(newObject);

    return this;
  }

  /**
   * Register an object as "dirty".
   *
   * @param {Object}   dirtyObject
   * @param {String[]} property
   *
   * @returns {UnitOfWork} Fluent interface
   */
  public registerDirty(dirtyObject: Object, ...property: Array<string>): UnitOfWork {
    this.newObjects.remove(dirtyObject);
    this.deletedObjects.remove(dirtyObject);
    this.dirtyObjects.add(dirtyObject);

    MetaData.forInstance(dirtyObject).fetchOrPut(`entityState.dirty`, []).push(...property);

    return this;
  }

  /**
   * Register an object as "deleted".
   *
   * @param {Object} deletedObject
   *
   * @returns {UnitOfWork} Fluent interface
   */
  public registerDeleted(deletedObject: Object): UnitOfWork {
    this.dirtyObjects.remove(deletedObject);
    this.newObjects.remove(deletedObject);
    this.deletedObjects.add(deletedObject);

    return this;
  }

  /**
   * Register an object as "clean".
   *
   * @param {Object} cleanObject
   *
   * @returns {UnitOfWork} Fluent interface
   */
  public registerClean(cleanObject: Object): UnitOfWork {
    this.dirtyObjects.remove(cleanObject);
    this.deletedObjects.remove(cleanObject);
    this.newObjects.remove(cleanObject);

    return this;
  }

  /**
   * Get the state of an object registered with this unit of work.
   * NOTE: Defaults to clean.
   *
   * @param {Object} targetObject
   *
   * @returns {String} The state of the target object.
   */
  public getObjectState(targetObject: Object): string {
    if (this.dirtyObjects.includes(targetObject)) {
      return UnitOfWork.STATE_DIRTY;
    }

    if (this.newObjects.includes(targetObject)) {
      return UnitOfWork.STATE_NEW;
    }

    if (this.deletedObjects.includes(targetObject)) {
      return UnitOfWork.STATE_DELETED;
    }

    return UnitOfWork.STATE_CLEAN;
  }

  /**
   * Commit the current state.
   *
   * @returns {Promise<UnitOfWork>}
   */
  public commit(): Promise<any> {
    return this.insertNew()
      .then(() => this.updateDirty())
      .then(() => this.deleteDeleted())
      .then(() => this.commitOrRollback(true))
      .then(() => this.refreshDirty())
      .then(() => this.clear())
      .catch(() => this.commitOrRollback(false));
  }

  /**
   * Either commit or rollback current transactions.
   *
   * @param {boolean} commit
   * @returns {Promise}
   */
  private commitOrRollback(commit: boolean = true): Promise<any> {
    let resolves = [];

    Object.getOwnPropertyNames(this.transactions).forEach(store => {
      resolves.push(this.transactions[store].transaction[commit ? 'commit' : 'rollback']());
    });

    return Promise.all(resolves);
  }

  /**
   * Mark all dirty entities as cleaned.
   *
   * @returns {UnitOfWork}
   */
  private markDirtyAsCleaned(): UnitOfWork {
    if (this.dirtyObjects && this.dirtyObjects.length > 0) {
      this.dirtyObjects.forEach(dirty => {
        MetaData.forInstance(dirty).put(`entityState.dirty`, []);
      });
    }

    this.dirtyObjects = new ArrayCollection;

    return this;
  }

  /**
   * Refresh all dirty entities.
   *
   * @returns {Promise<any>}
   */
  private refreshDirty(): Promise<void> {
    return this.entityManager.refresh(...this.dirtyObjects);
  }

  /**
   * Get the transaction for this unit of work, and provided target entity.
   *
   * @param {EntityInterface} target
   *
   * @returns {Promise}
   */
  private getTransaction(target: EntityInterface): Promise<any> {
    let store     = this.entityManager.getStore(target);
    let storeName = store.getName();

    if (this.transactions[storeName]) {
      return Promise.resolve(this.transactions[storeName]);
    }

    return new Promise(resolve => {
      let connection = store.getConnection(Store.ROLE_MASTER);

      connection.transaction(transaction => {
        this.transactions[storeName] = {connection: connection, transaction: transaction};

        resolve(this.transactions[storeName]);
      });
    });
  }

  /**
   * Persist provided targets using provided handler.
   *
   * @param {EntityInterface} targets
   * @param {Function}        handler
   *
   * @returns {Promise<any>}
   */
  private persist(targets: Array<EntityInterface>, handler: Function): Promise<any> {
    let statementHandlers = [];

    targets.forEach(target => statementHandlers.push(this.persistTarget(target, handler)));

    return Promise.all(statementHandlers);
  }

  /**
   * Persist specific target.
   *
   * @param {EntityInterface} target
   * @param {Function}        handler
   *
   * @returns {Promise<any>}
   */
  private persistTarget(target: EntityInterface, handler: Function): Promise<any> {
    return this.getTransaction(target)
      .then(transaction => {
        let tableName    = Mapping.forEntity(target).getEntityName();
        let queryBuilder = this.entityManager.getRepository(target).getQueryBuilder(null, transaction.connection(tableName));

        queryBuilder.getQuery().getStatement().transacting(transaction);

        return handler(queryBuilder, target);
      });
  }

  /**
   * Persist new entities.
   *
   * @returns {Promise<any>}
   */
  private insertNew(): Promise<any> {
    return this.persist(this.newObjects, (queryBuilder: QueryBuilder, target) => {
      let mapping    = Mapping.forEntity(target);
      let primaryKey = mapping.getPrimaryKeyField();

      return queryBuilder.insert(target, primaryKey).getQuery().execute().then(result => target[primaryKey] = result[0]);
    });
  }

  /**
   * Update dirty entities.
   *
   * @returns {Promise<any>}
   */
  private updateDirty(): Promise<any> {
    return this.persist(this.dirtyObjects, (queryBuilder: QueryBuilder, target) => {
      let dirtyProperties = MetaData.forInstance(target).fetch(`entityState.dirty`, []);
      let primaryKey      = Mapping.forEntity(target).getPrimaryKeyField();
      let values          = target;

      if (dirtyProperties.length > 0) {
        let newValues = {};

        dirtyProperties.forEach(dirtyProperty => {
          newValues[dirtyProperty] = values[dirtyProperty];
        });

        values = newValues;
      }

      return queryBuilder.update(values).where({[primaryKey]: target[primaryKey]}).getQuery().execute();
    });
  }

  /**
   * Delete removed entities from the database.
   *
   * @returns {Promise<any>}
   */
  private deleteDeleted(): Promise<any> {
    return this.persist(this.deletedObjects, (queryBuilder: QueryBuilder, target) => {
      let primaryKey = Mapping.forEntity(target).getPrimaryKeyField();

      return queryBuilder.remove().where({[primaryKey]: target[primaryKey]}).getQuery().execute();
    });
  }

  /**
   * Roll back all affected objects.
   *
   * - Revert changes in dirty entities.
   * - Un-persist new entities.
   * - Unstage deleted entities.
   * - Refresh persisted entities.
   *
   * @returns {UnitOfWork}
   */
  public clear(): UnitOfWork {
    this.deletedObjects = new ArrayCollection;
    this.newObjects     = new ArrayCollection;
    this.transactions   = {};

    this.markDirtyAsCleaned();

    return this;
  }
}
