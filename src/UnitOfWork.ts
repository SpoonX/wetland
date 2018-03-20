import * as knex from 'knex';
import {ArrayCollection} from './ArrayCollection';
import {Store} from './Store';
import {EntityInterface, ProxyInterface} from './EntityInterface';
import {Mapping} from './Mapping';
import {Scope} from './Scope';
import {QueryBuilder} from './QueryBuilder';
import {MetaData} from './MetaData';
import {EntityProxy} from './EntityProxy';

/**
 * Maintains a list of objects affected by a business transaction and -
 *  coordinates the writing out of changes and the resolution of concurrency problems.
 *
 * @export
 * @class UnitOfWork
 */
export class UnitOfWork {

  /**
   * @type {string}
   */
  public static STATE_UNKNOWN: string = 'unknown';

  /**
   * @type {string}
   */
  public static STATE_CLEAN: string = 'clean';

  /**
   * @type {string}
   */
  public static STATE_DIRTY: string = 'dirty';

  /**
   * @type {string}
   */
  public static STATE_NEW: string = 'new';

  /**
   * @type {string}
   */
  public static STATE_DELETED: string = 'deleted';

  /**
   * @type {string}
   */
  public static RELATIONSHIP_ADDED: string = 'relationship_new';

  /**
   * @type {string}
   */
  public static RELATIONSHIP_REMOVED: string = 'relationship_removed';

  /**
   * Holds a list of objects that have been marked as being "dirty".
   *
   * @type {ArrayCollection}
   */
  private dirtyObjects: ArrayCollection<EntityProxy> = new ArrayCollection;

  /**
   * Holds a list of objects that have been marked as being "new".
   *
   * @type {ArrayCollection}
   */
  private newObjects: ArrayCollection<EntityProxy> = new ArrayCollection;

  /**
   * Holds a list of objects that have been marked as being "deleted".
   *
   * @type {ArrayCollection}
   */
  private deletedObjects: ArrayCollection<EntityProxy> = new ArrayCollection;

  /**
   * Holds a list of objects that have been marked as being "clean".
   *
   * @type {ArrayCollection}
   */
  private cleanObjects: ArrayCollection<EntityProxy> = new ArrayCollection;

  /**
   * Holds a list of objects that have been marked as having relationship changes.
   *
   * @type {ArrayCollection}
   */
  private relationshipsChangedObjects: ArrayCollection<EntityProxy> = new ArrayCollection;

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {{}|null}
   */
  private transactions: Object = {};

  /**
   * @type {Array}
   */
  private afterCommit: Array<{target: EntityInterface, method: string, parameters: Array<any>}> = [];

  /**
   * Create a new UnitOfWork.
   *
   * @param {Scope} entityManager
   */
  public constructor(entityManager: Scope) {
    this.entityManager = entityManager;
  }

  /**
   * Return objects marked as dirty.
   *
   * @returns {ArrayCollection<EntityProxy>}
   */
  public getDirtyObjects(): ArrayCollection<EntityProxy> {
    return this.dirtyObjects;
  }

  /**
   * Return objects marked as new.
   *
   * @returns {ArrayCollection<EntityProxy>}
   */
  public getNewObjects(): ArrayCollection<EntityProxy> {
    return this.newObjects;
  }

  /**
   * Return objects marked as deleted.
   *
   * @returns {ArrayCollection<EntityProxy>}
   */
  public getDeletedObjects(): ArrayCollection<EntityProxy> {
    return this.deletedObjects;
  }

  /**
   * Return objects marked as clean.
   *
   * @returns {ArrayCollection<EntityProxy>}
   */
  public getCleanObjects(): ArrayCollection<EntityProxy> {
    return this.cleanObjects;
  }

  /**
   * Return objects marked as having relationship changes.
   *
   * @returns {ArrayCollection<EntityProxy>}
   */
  public getRelationshipsChangedObjects(): ArrayCollection<EntityProxy> {
    return this.relationshipsChangedObjects;
  }

  /**
   * Get the entity manager used by this unit of work.
   *
   * @returns {Scope}
   */
  public getEntityManager(): Scope {
    return this.entityManager;
  }

  /**
   * Get the state for provided entity.
   *
   * @param {ProxyInterface} entity
   *
   * @returns {string}
   */
  public static getObjectState(entity: ProxyInterface): string {
    return MetaData.forInstance(entity).fetch('entityState.state', UnitOfWork.STATE_UNKNOWN);
  }

  /**
   * Returns if provided entity has relationship changes.
   *
   * @param {EntityInterface} entity
   *
   * @returns {boolean}
   */
  public static hasRelationChanges(entity: EntityInterface): boolean {
    return !!MetaData.forInstance(entity).fetch('entityState.relations');
  }

  /**
   * Returns as provided entity is clean
   *
   * @param {EntityInterface} entity
   *
   * @returns {boolean}
   */
  public static isClean(entity: EntityInterface): boolean {
    return UnitOfWork.getObjectState(entity) === UnitOfWork.STATE_CLEAN && !UnitOfWork.hasRelationChanges(entity);
  }

  /**
   * Returns if provided entity is dirty.
   *
   * @param {EntityInterface} entity
   *
   * @returns {boolean}
   */
  public static isDirty(entity: EntityInterface): boolean {
    return !UnitOfWork.isClean(entity);
  }

  /**
   * Register a collection change between `targetEntity` and `relationEntity`
   *
   * @param {string} change
   * @param {Object} targetEntity
   * @param {string} property
   * @param {Object} relationEntity
   *
   * @returns {UnitOfWork}
   */
  public registerCollectionChange(change: string, targetEntity: Object, property: string, relationEntity: Object): UnitOfWork {
    let addTo           = change === UnitOfWork.RELATIONSHIP_ADDED ? 'added' : 'removed';
    let removeFrom      = change === UnitOfWork.RELATIONSHIP_ADDED ? 'removed' : 'added';
    let targetMeta      = MetaData.forInstance(targetEntity);
    let relationChanges = targetMeta.fetchOrPut('entityState.relations', {added: {}, removed: {}});
    let removeFromList  = relationChanges[removeFrom];

    // If given relationEntity was already staged as a change for the other side.
    if (removeFromList[property] && removeFromList[property].includes(relationEntity)) {

      // Unstage it.
      removeFromList[property].remove(relationEntity);

      // If this then was the last staged item in the list for this relation, remove the list.
      if (removeFromList[property].length === 0) {
        delete removeFromList[property];
      }

      // If after all this the added and removed lists are empty...
      if (Object.keys(relationChanges.added).length === 0 && Object.keys(relationChanges.removed).length === 0) {

        // remove the entity from staged...
        this.relationshipsChangedObjects.remove(targetEntity);

        // and remove the relations meta data.
        targetMeta.remove('entityState.relations');
      }

      // And return. It's not a change when simply being un-staged (re-added or re-removed).
      return this;
    }

    let addToList       = relationChanges[addTo];
    let addToCollection = addToList[property] ? addToList[property] : addToList[property] = new ArrayCollection;

    addToCollection.add(relationEntity);

    this.relationshipsChangedObjects.add(targetEntity);

    return this;
  }

  /**
   * Register a relationship change between `targetEntity` and `relationEntity`
   *
   * @param {string} change
   * @param {Object} targetEntity
   * @param {string} property
   * @param {Object} relationEntity
   *
   * @returns {UnitOfWork}
   */
  public registerRelationChange(change: string, targetEntity: Object, property: string, relationEntity: EntityInterface): UnitOfWork {
    let addTo           = change === UnitOfWork.RELATIONSHIP_ADDED ? 'added' : 'removed';
    let removeFrom      = change === UnitOfWork.RELATIONSHIP_ADDED ? 'removed' : 'added';
    let targetMeta      = MetaData.forInstance(targetEntity);
    let relationChanges = targetMeta.fetchOrPut('entityState.relations', {added: {}, removed: {}});
    let removeFromList  = relationChanges[removeFrom];

    // If provided relationEntity was already staged for the other side...
    if (removeFromList[property] === relationEntity) {

      // Remove it. We don't have to add anything.
      delete removeFromList[property];

      // If after all this the added and removed lists are empty...
      if (Object.keys(relationChanges.added).length === 0 && Object.keys(relationChanges.removed).length === 0) {

        // remove the entity from staged...
        this.relationshipsChangedObjects.remove(targetEntity);

        // and remove the relations meta data.
        targetMeta.remove('entityState.relations');
      }

      // And return. It's not a change when simply being un-staged (re-added or re-removed).
      return this;
    }

    relationChanges[addTo][property] = relationEntity;

    this.relationshipsChangedObjects.add(targetEntity);

    return this;
  }

  /**
   * Set the state of an entity.
   *
   * @param {ProxyInterface} entity
   * @param {string}          state
   *
   * @returns {UnitOfWork}
   */
  public setEntityState(entity: ProxyInterface, state: string): UnitOfWork {
    let target        = entity.isEntityProxy ? entity.getTarget() : entity;
    let metaData      = MetaData.forInstance(target);
    let previousState = metaData.fetch('entityState.state', UnitOfWork.STATE_UNKNOWN);

    if (previousState === state) {
      return this;
    }

    // Doesn't make sense. But is just to prevent user from changing clean to new.
    if (previousState === UnitOfWork.STATE_CLEAN && state === UnitOfWork.STATE_NEW) {
      return this;
    }

    if (previousState !== UnitOfWork.STATE_UNKNOWN) {
      this[`${previousState}Objects`].remove(target);
    }

    this[`${state}Objects`].add(target);

    metaData.put('entityState.state', state);

    return this;
  }

  /**
   * Register an object as "new".
   *
   * @param {Object} newObject
   *
   * @returns {UnitOfWork} Fluent interface
   */
  public registerNew(newObject: Object): UnitOfWork {
    let objectState = UnitOfWork.getObjectState(newObject);

    if (objectState === UnitOfWork.STATE_NEW) {
      return this;
    }

    if (objectState !== UnitOfWork.STATE_UNKNOWN) {
      throw new Error(`Only unregistered entities can be marked as new. Entity '${newObject.constructor.name}' has state '${objectState}'.`);
    }

    this.setEntityState(newObject, UnitOfWork.STATE_NEW);

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
  public registerDirty(dirtyObject: EntityProxy, ...property: Array<string>): UnitOfWork {
    if (!property.length) {
      throw new Error(
        `Can't mark instance of '${dirtyObject.constructor.name}' as dirty without supplying properties.`
      );
    }

    let metaData    = MetaData.forInstance(dirtyObject);
    let entityState = metaData.fetchOrPut('entityState', {state: UnitOfWork.STATE_UNKNOWN});

    if (entityState.state === UnitOfWork.STATE_NEW || entityState.state === UnitOfWork.STATE_UNKNOWN) {
      return this;
    }

    if (entityState.state === UnitOfWork.STATE_DELETED) {
      throw new Error('Trying to mark entity staged for deletion as dirty.');
    }

    this.setEntityState(dirtyObject, UnitOfWork.STATE_DIRTY);

    metaData.fetchOrPut('entityState.dirty', []).push(...property);

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
    return this.setEntityState(deletedObject, UnitOfWork.STATE_DELETED);
  }

  /**
   * Register an object as "clean".
   *
   * @param {Object}  cleanObject The clean object
   * @param {boolean} fresh       Skip checks for other states (performance).
   *
   * @returns {UnitOfWork} Fluent interface
   */
  public registerClean(cleanObject: Object, fresh: boolean = false): UnitOfWork {
    if (!fresh) {
      this.revertRelationshipChanges(cleanObject);
      this.markDirtyAsCleaned(cleanObject);
    }

    this.setEntityState(cleanObject, UnitOfWork.STATE_CLEAN);

    return this;
  }

  /**
   * Prepare the cascades for provided entity.
   *
   * @param {EntityInterface} entity
   *
   * @returns {UnitOfWork}
   */
  public prepareCascadesFor(entity: EntityInterface): UnitOfWork {
    let mapping   = Mapping.forEntity(entity);
    let relations = mapping.getRelations();

    // If no relations, no need to check for cascade operations.
    if (null === relations) {
      return this;
    }

    // There are relations, let's check if there's anything that could and should be cascaded.
    Object.getOwnPropertyNames(relations).forEach(property => {
      // Not even an object? No need to perform _any_ checks.
      if (typeof entity[property] !== 'object' || entity[property] === null) {
        return;
      }

      // Is this relation a *ToMany?
      if (!(entity[property] instanceof Array)) {
        this.cascadeSingle(entity, property, entity[property], mapping);

        this.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, entity, property, entity[property]);

        return;
      }

      entity[property].forEach(relation => {
        this.cascadeSingle(entity, property, relation, mapping);

        // Let's link up this new relation with entity.
        this.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, entity, property, relation);
      });
    });

    return this;
  }

  /**
   * Prepare cascades for a single entity.
   *
   * @param {EntityInterface} entity
   * @param {string}          property
   * @param {EntityInterface} relation
   * @param {Mapping}         mapping
   *
   * @returns {UnitOfWork}
   */
  private cascadeSingle<T>(entity: T, property: string, relation: EntityInterface, mapping: Mapping<T>): UnitOfWork {
    let relationState = UnitOfWork.getObjectState(relation);

    // Why are you trying to link this entity up with something that will be deleted? Silly.
    if (relationState === UnitOfWork.STATE_DELETED) {
      throw new Error(
        `Trying to add relation with entity on "${mapping.getEntityName()}.${property}" that has been staged for removal.`
      );
    }

    // Is the entity we're trying to set up a relationship with un-persisted?
    if (relationState === UnitOfWork.STATE_UNKNOWN) {
      let cascades = mapping.getField(property).cascades;

      // No cascades? Then throw an error. We can't cascade-persist something we don't have.
      if (!Array.isArray(cascades) || !cascades.includes(Mapping.CASCADE_PERSIST)) {
        throw new Error(`Un-persisted relation found on "${mapping.getEntityName()}.${property}". Either persist the entity, or use the cascade persist option.`);
      }

      // Woo, cascade persist. Cascade child as well.
      this.prepareCascadesFor(relation);

      // And register relation as new.
      this.registerNew(relation);
    }

    return this;
  }

  /**
   * Prepare cascades for all staged changes.
   *
   * @returns {UnitOfWork}
   */
  public prepareCascades(): UnitOfWork {
    if (this.newObjects.length) {
      this.newObjects.forEach(entity => this.prepareCascadesFor(entity));
    }

    if (!this.relationshipsChangedObjects.length) {
      return this;
    }

    this.relationshipsChangedObjects.forEach(changed => {
      let relationChanges = MetaData.forInstance(changed).fetch('entityState.relations');
      let mapping         = Mapping.forEntity(changed);
      let relations       = mapping.getRelations();
      let processChanged  = changedType => {
        Object.getOwnPropertyNames(relationChanges[changedType]).forEach(property => {
          let changes = relationChanges[changedType];

          if (!(changes[property] instanceof Array)) {
            this.cascadeSingle(changed, property, changes[property], mapping);

            return;
          }

          changes[property].forEach(target => {
            this.cascadeSingle(changed, property, target, mapping);
          });
        });
      };

      processChanged('added');
      processChanged('removed');
    });

    return this;
  }

  /**
   * Commit the current state.
   *
   * @param {boolean} skipClean
   * @param {boolean} skipLifecycleHooks
   *
   * @returns {Promise<UnitOfWork>}
   */
  public commit(skipClean: boolean = false, skipLifecycleHooks: boolean = false): Promise<any> {
    this.prepareCascades();

    return this.insertNew(skipLifecycleHooks)
      .then(() => this.updateDirty(skipLifecycleHooks))
      .then(() => this.deleteDeleted(skipLifecycleHooks))
      .then(() => this.updateRelationships())
      .then(() => this.commitOrRollback(true))
      .then(() => this.entityManager.getConfig().fetch('entityManager.refreshUpdated') && this.refreshDirty())
      .then(() => this.entityManager.getConfig().fetch('entityManager.refreshCreated') && this.refreshNew())
      .then(() => !skipClean && this.cleanObjectsAndTransactions())
      .then(() => !skipClean && this.processAfterCommit())
      .then(() => !skipClean && this.cleanAfterCommit())
      .catch(error => this.commitOrRollback(false, error));
  }

  /**
   * Execute post commit lifecyle callbacks.
   *
   * @return {Promise<Array<Function>>}
   */
  private processAfterCommit(): Promise<Array<Function>> {
    let methods = [];

    this.afterCommit.forEach(action => {
      methods.push(action.target[action.method](...action.parameters, this.entityManager));
    });

    return Promise.all(methods);
  }

  /**
   * Apply lifecycle callbacks for entity.
   *
   * @param {string}          method
   * @param {EntityInterface} entity
   * @param {*[]}             parameters
   *
   * @returns {Promise<any>}
   */
  private lifecycleCallback(method: string, entity: EntityInterface, ...parameters: Array<any>): Promise<any> {
    let beforeMethod = 'before' + method[0].toUpperCase() + method.substr(1);
    let afterMethod  = 'after' + method[0].toUpperCase() + method.substr(1);

    if (typeof entity[afterMethod] === 'function') {
      this.afterCommit.push({target: entity, method: afterMethod, parameters});
    }

    let callbackResult = typeof entity[beforeMethod] === 'function'
      ? entity[beforeMethod](...parameters, this.entityManager)
      : null;

    return Promise.resolve(callbackResult);
  }

  /**
   * Either commit or rollback current transactions.
   *
   * @param {boolean} commit
   * @param {Error}   error
   *
   * @returns {Promise}
   */
  private commitOrRollback(commit: boolean = true, error?: Error): Promise<any> {
    let resolves = [];
    let method   = commit ? 'commit' : 'rollback';

    Object.getOwnPropertyNames(this.transactions).forEach(store => {
      resolves.push(this.transactions[store].transaction[method]());
    });

    if (!commit) {
      this.rollbackIds();
    }

    return Promise.all(resolves).then(() => {
      this.transactions = {};

      if (error) {
        throw error;
      }
    });
  }

  /**
   * Rollback previously applied IDs.
   *
   * @returns {UnitOfWork}
   */
  private rollbackIds(): UnitOfWork {
    this.newObjects.forEach(newObject => {
      if (newObject.isEntityProxy) {
        newObject.deactivateProxying();
      }

      delete newObject[Mapping.forEntity(newObject).getPrimaryKey()];
    });

    return this;
  }

  /**
   * Mark all dirty entities as cleaned.
   *
   * @param {EntityInterface} target
   *
   * @returns {UnitOfWork}
   */
  private markDirtyAsCleaned(target?: EntityInterface): UnitOfWork {
    if (target) {
      MetaData.forInstance(target).remove('entityState.dirty');

      this.dirtyObjects.remove(target);
    } else if (this.dirtyObjects && this.dirtyObjects.length > 0) {
      this.dirtyObjects.forEach(dirty => this.markDirtyAsCleaned(dirty));
    } else {
      this.dirtyObjects = new ArrayCollection;
    }

    return this;
  }

  /**
   * Mark all dirty entities as cleaned.
   *
   * @param {EntityInterface} target
   *
   * @returns {UnitOfWork}
   */
  private revertRelationshipChanges(target?: EntityInterface): UnitOfWork {
    if (target) {
      MetaData.forInstance(target).remove('entityState.relations');

      this.relationshipsChangedObjects.remove(target);
    } else if (this.relationshipsChangedObjects && this.relationshipsChangedObjects.length > 0) {
      this.relationshipsChangedObjects.forEach(changed => this.revertRelationshipChanges(changed));
    } else {
      this.relationshipsChangedObjects = new ArrayCollection;
    }

    return this;
  }

  /**
   * Clear the state for provided entity.
   *
   * @param {EntityInterface} entity
   * EntityInterface
   * @returns {UnitOfWork}
   */
  public clearEntityState(entity: EntityInterface): UnitOfWork {
    MetaData.forInstance(entity).remove('entityState');

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
   * Refresh all new entities.
   *
   * @returns {Promise<any>}
   */
  private refreshNew(): Promise<void> {
    return this.entityManager.refresh(...this.newObjects);
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

    if (!this.transactions[storeName]) {
      this.transactions[storeName] = new Promise((resolve, reject) => {
        let connection = store.getConnection(Store.ROLE_MASTER);

        connection.transaction(transaction => {
          this.transactions[storeName] = {connection: connection, transaction: transaction};

          resolve(this.transactions[storeName]);
        }).catch(error => reject(error));
      });
    }

    if (this.transactions[storeName] instanceof Promise) {
      return this.transactions[storeName];
    }

    return Promise.resolve(this.transactions[storeName]);
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
  private persistTarget(target: ProxyInterface, handler: Function): Promise<any> {
    return this.getTransaction(target)
      .then(transaction => {
        let tableName    = Mapping.forEntity(target).getTableName();
        let queryBuilder = this.entityManager
          .getRepository(this.entityManager.resolveEntityReference(target))
          .getQueryBuilder(null, transaction.connection(tableName));

        queryBuilder.getQuery().getStatement().transacting(transaction.transaction);

        return handler(queryBuilder, target);
      });
  }

  /**
   * Persist new entities.
   *
   * @param {boolean} skipLifecyclehooks
   *
   * @returns {Promise<any>}
   */
  private insertNew(skipLifecyclehooks: boolean = false): Promise<any> {
    return this.persist(this.newObjects, <T>(queryBuilder: QueryBuilder<T>, target: T & ProxyInterface) => {
      let mapping           = Mapping.forEntity(target);
      let primaryKey        = mapping.getPrimaryKey();
      let primaryKeyMapping = mapping.getField(primaryKey);
      let isGeneratedValue  = !!primaryKeyMapping.generatedValue;

      const executeInsertion = () => {
        // Since returning won't work with sqlite properly (see: https://github.com/tgriesser/knex/issues/1660)
        // we use the already present PK if it isn't autogenerated
        return queryBuilder.insert(target, primaryKey).getQuery().execute()
          .then(result => {
            let primaryKeyValue = isGeneratedValue ? result[0] : target[primaryKey];

            if (target.isEntityProxy) {
              target[primaryKey] = {_skipDirty: primaryKeyValue};

              target.activateProxying();
            } else {
              target[primaryKey] = primaryKeyValue;
            }
          });
      };

      if (skipLifecyclehooks) {
        return executeInsertion();
      }

      return this.lifecycleCallback('create', target)
        .then(() => executeInsertion());
    });
  }

  /**
   * Update dirty entities.
   *
   * @param {boolean} skipLifecyclehooks
   *
   * @returns {Promise<any>}
   */
  private updateDirty(skipLifecyclehooks: boolean = false): Promise<any> {
    return this.persist(this.dirtyObjects, <T>(queryBuilder: QueryBuilder<T>, target: T) => {
      let dirtyProperties = MetaData.forInstance(target).fetch(`entityState.dirty`, []);
      let targetMapping   = Mapping.forEntity(target);
      let primaryKey      = targetMapping.getPrimaryKeyField();
      let newValues       = {};

      if (dirtyProperties.length > 0) {
        dirtyProperties.forEach(dirtyProperty => {
          newValues[dirtyProperty] = target[dirtyProperty];
        });
      }

      const executeUpdate = () => {
        return queryBuilder.update(newValues).where({[primaryKey]: target[primaryKey]}).getQuery().execute();
      };

      if (skipLifecyclehooks) {
        return executeUpdate();
      }

      return this.lifecycleCallback('update', target, newValues)
        .then(() => executeUpdate());
    });
  }

  /**
   * Delete removed entities from the database.
   *
   * @param {boolean} skipLifecyclehooks
   *
   * @returns {Promise<any>}
   */
  private deleteDeleted(skipLifecyclehooks: boolean = false): Promise<any> {
    return this.persist(this.deletedObjects, <T>(queryBuilder: QueryBuilder<T>, target: T & EntityProxy) => {
      let primaryKey = Mapping.forEntity(target).getPrimaryKeyField();

      // @todo Use target's mapping to delete relations for non-cascaded properties.

      const executeDelete = () => {
        return queryBuilder.remove().where({[primaryKey]: target[primaryKey]}).getQuery().execute();
      };

      if (skipLifecyclehooks) {
        return executeDelete();
      }

      return this.lifecycleCallback('remove', target, this.deletedObjects)
        .then(() => executeDelete());
    });
  }

  /**
   * Apply relationship changes in the database.
   *
   * @returns {Promise<{}>}
   */
  private updateRelationships(): Promise<Object> {
    // Whoa boy! This is going to be fun!
    let relationshipUpdates = [];

    this.relationshipsChangedObjects.forEach(changed => {
      let changedMapping = Mapping.forEntity(changed);
      let changedMeta    = MetaData.forInstance(changed).fetch('entityState.relations');
      let relations      = changedMapping.getRelations();

      // Apply changes (remove or add)
      let applyChanges = (from, action) => {
        Object.getOwnPropertyNames(changedMeta[from]).forEach(property => {
          let newRelations = changedMeta[from][property];

          if (!(newRelations instanceof ArrayCollection)) {
            return relationshipUpdates.push(persistRelationChange(action, changed, property, newRelations));
          }

          newRelations.forEach(newRelation => {
            relationshipUpdates.push(persistRelationChange(action, changed, property, newRelation));
          });
        });
      };

      // Persist the relation change
      let persistRelationChange = (action, owning, property, other) => {
        let relation = relations[property];

        if (relation.type !== Mapping.RELATION_MANY_TO_MANY) {
          let mapping    = relation.mappedBy ? Mapping.forEntity(other) : changedMapping;
          let owningSide = relation.mappedBy ? other : changed;
          let otherSide  = relation.mappedBy ? changed : other;
          let joinColumn = mapping.getJoinColumn(relation.mappedBy ? relation.mappedBy : property);
          let primaryKey = mapping.getPrimaryKey();

          // Update id of property on own side, based on joinColumn.
          return this.persistTarget(owningSide, <T>(queryBuilder: QueryBuilder<T>, target: T) => {
            let query    = queryBuilder.where({[primaryKey]: target[primaryKey]});
            let newValue = otherSide[joinColumn.referencedColumnName];

            if (action === UnitOfWork.RELATIONSHIP_REMOVED) {
              query.where({[joinColumn.name]: newValue});

              newValue = null;
            }

            return query.update({[joinColumn.name]: newValue}).getQuery().execute();
          });
        }

        let owningSide = relation.mappedBy ? other : owning;
        let otherSide  = relation.mappedBy ? owning : other;
        let joinTable  = relation.mappedBy
          ? Mapping.forEntity(other).getJoinTable(relation.mappedBy)
          : changedMapping.getJoinTable(property);

        // Create a new row in join table.
        return this.getTransaction(owningSide)
          .then(transaction => {
            let queryBuilder = transaction.connection(joinTable.name);
            let values       = {};

            joinTable.joinColumns.forEach(column => {
              values[column.name] = owningSide[column.referencedColumnName];
            });

            joinTable.inverseJoinColumns.forEach(column => {
              values[column.name] = otherSide[column.referencedColumnName];
            });

            if (action === UnitOfWork.RELATIONSHIP_ADDED) {
              let query = queryBuilder.insert(values).transacting(transaction.transaction);

              UnitOfWork.logQuery(query);

              return query.then();
            }

            let query = queryBuilder.where(values).del().transacting(transaction.transaction).then();

            UnitOfWork.logQuery(query);

            return query;
          });
      };

      applyChanges('added', UnitOfWork.RELATIONSHIP_ADDED);
      applyChanges('removed', UnitOfWork.RELATIONSHIP_REMOVED);
    });

    return Promise.all(relationshipUpdates);
  }

  /**
   * Log a query.
   *
   * @param {knex.QueryBuilder} query
   */
  static logQuery(query: knex.QueryBuilder): void {
    if (process.env.LOG_QUERIES) {
      console.log('Executing query:', query.toString());
    }
  }

  /**
   * Roll back all affected objects.
   *
   * - Revert changes in dirty entities.
   * - Un-persist new entities.
   * - Unstage deleted entities.
   * - Refresh persisted entities.
   *
   * @param {EntityInterface[]} entities
   *
   * @returns {UnitOfWork}
   */
  public clear(...entities: Array<EntityInterface | ProxyInterface>): UnitOfWork {
    if (entities.length) {
      entities.forEach(entity => this.clearEntityState(entity))
      this.relationshipsChangedObjects.remove(...entities);
      this.dirtyObjects.remove(...entities);
      this.deletedObjects.remove(...entities);
      this.newObjects.remove(...entities);
      this.cleanObjects.remove(...entities);
    } else {
      this.newObjects.forEach(created => this.clearEntityState(created))
      this.deletedObjects.forEach(deleted => this.clearEntityState(deleted))
      this.cleanObjects.forEach(clean => this.clearEntityState(clean))
      this.relationshipsChangedObjects.forEach(changed => this.clearEntityState(changed))

      this.newObjects                  = new ArrayCollection;
      this.deletedObjects              = new ArrayCollection;
      this.cleanObjects                = new ArrayCollection;
      this.relationshipsChangedObjects = new ArrayCollection;
      this.dirtyObjects                = new ArrayCollection;
    }

    this.transactions = {};
    this.afterCommit  = [];

    return this;
  }

  /**
   * Empty after commit.
   *
   * @return {Promise<void>}
   */
  private cleanAfterCommit(): Promise<void> {
    this.afterCommit = [];

    return Promise.resolve();
  }

  /**
   * Mark everything as clean and empty transactions.
   *
   * @return {Promise<void>}
   */
  private cleanObjectsAndTransactions(): Promise<void> {
    this.newObjects.each(created => this.registerClean(created));
    this.dirtyObjects.each(updated => this.registerClean(updated));
    this.relationshipsChangedObjects.each(changed => this.registerClean(changed));
    this.deletedObjects.each(deleted => this.clearEntityState(deleted));

    this.deletedObjects = new ArrayCollection;
    this.transactions   = {};

    return Promise.resolve();
  }

  /**
   * Mark everything as clean, empty transactions and empty after commits.
   *
   * @returns {UnitOfWork}
   */
  public clean(): Promise<void> {
    return this.cleanObjectsAndTransactions()
      .then(() => this.cleanAfterCommit());
  }
}
