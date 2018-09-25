import { EntityManager } from './EntityManager';
import { Store, PoolConfig, ReplicationConfig, SingleConfig } from './Store';
import { Homefront } from 'homefront';
import { Scope } from './Scope';
import { EntityInterface, EntityCtor } from './EntityInterface';
import { Migrator } from './Migrator/Migrator';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { SnapshotManager } from './SnapshotManager';
import { SchemaManager } from './SchemaManager';
import { Populate } from './Populate';
import { Seeder } from './Seeder';
import { Cleaner } from './Cleaner';

export const entityFilterRegexp = /^.*[^d]\.(js|ts)$/;
export const entityExtensionRegexp = /\.(js|ts)$/;

export class Wetland {
  /**
   * @type {EntityManager}
   */
  private entityManager: EntityManager = new EntityManager(this);

  /**
   * @type {Migrator}
   */
  private migrator: Migrator;

  /**
   * @type {SnapshotManager}
   */
  private snapshotManager: SnapshotManager;

  /**
   * @type {Homefront}
   */
  private config: Homefront = new Homefront({
    debug         : false,
    useForeignKeys: true,
    dataDirectory : path.resolve(process.cwd(), '.data'),
    defaultStore  : 'defaultStore',
    mapping       : {
      defaultNamesToUnderscore: false,
      defaults                : { cascades: [] },
    },
    entityManager : {
      refreshCreated: true,
      refreshUpdated: true,
    },
  });

  /**
   * @type {{}}
   */
  private stores: { [key: string]: Store } = {};

  /**
   * @type {SchemaManager}
   */
  private schema: SchemaManager;

  /**
   * Construct a new wetland instance.
   *
   * @param {{}} [config]
   */
  public constructor(config?: Object) {
    this.ensureDataDirectory(this.config.fetch('dataDirectory'));
    this.setupExitListeners();
    this.initializeConfig(config);
  }

  /**
   * Initialize the config.
   *
   * @param {{}} config
   */
  private initializeConfig(config: Object) {
    if (config) {
      this.config.merge(config);
    }

    let stores      = this.config.fetch('stores');
    let entities    = this.config.fetch('entities');
    let entityPaths = this.config.fetch('entityPaths', []);
    let entityPath  = this.config.fetch('entityPath');

    if (stores) {
      this.registerStores(stores);
    } else {
      this.registerDefaultStore();
    }

    if (entities) {
      this.registerEntities(entities);
    }

    if (entityPath) {
      entityPaths.push(entityPath);
    }

    if (!entityPaths.length) {
      return;
    }

    entityPaths.forEach(entityPath => {
      fs.readdirSync(entityPath)
        .filter(match => match.search(entityFilterRegexp) > -1)
        .map(entity => entity.replace(entityExtensionRegexp, ''))
        .forEach(entity => {
          let filePath     = path.resolve(entityPath, entity);
          let entityModule = require(filePath);
          let ToRegister   = entityModule;

          if (typeof ToRegister !== 'function') {
            ToRegister = entityModule.default;
          }

          if (typeof ToRegister !== 'function') {
            ToRegister = entityModule[entity];
          }

          if (typeof ToRegister !== 'function') {
            throw new Error(`Error loading entity '${entity}'. No constructor exported.`);
          }

          this.registerEntity(ToRegister);
        });
    });
  }

  /**
   * Get the wetland config.
   *
   * @returns {Homefront}
   */
  public getConfig(): Homefront {
    return this.config;
  }

  /**
   * Register an entity with the entity manager.
   *
   * @param {EntityInterface} entity
   *
   * @returns {Wetland}
   */
  public registerEntity(entity: EntityCtor<EntityInterface>): Wetland {
    this.entityManager.registerEntity(entity);

    return this;
  }

  /**
   * Register multiple entities with the entity manager.
   *
   * @param {EntityInterface[]} entities
   *
   * @returns {Wetland}
   */
  public registerEntities(entities: Array<EntityCtor<EntityInterface>>): Wetland {
    this.entityManager.registerEntities(entities);

    return this;
  }

  /**
   * Register stores with wetland.
   *
   * @param {Object} stores
   *
   * @returns {Wetland}
   */
  public registerStores(stores: Object): Wetland {
    for (let store in stores) {
      this.registerStore(store, stores[store]);
    }

    return this;
  }

  /**
   * Register a store with wetland.
   *
   * @param {string} store
   * @param {{}}     config
   *
   * @returns {Wetland}
   */
  public registerStore(store: string, config: PoolConfig | ReplicationConfig | SingleConfig): Wetland {
    if (this.config.fetch('debug')) {
      config.debug = true;
    }

    this.stores[store] = new Store(store, config);

    // The first registered store is the default store.
    this.config.fetchOrPut('defaultStore', store);

    return this;
  }

  /**
   * Get a store by name.
   *
   * @param {string} storeName
   *
   * @returns {Store}
   */
  public getStore(storeName?: string): Store {
    storeName = storeName || this.config.fetch('defaultStore');

    if (!storeName) {
      throw new Error('No store name supplied, and no default store found.');
    }

    let store = this.stores[storeName];

    if (!store) {
      throw new Error(`No store called "${storeName}" found.`);
    }

    return store;
  }

  /**
   * Get a seeder.
   *
   * @return {Seeder}
   */
  public getSeeder(): Seeder {
    return new Seeder(this);
  }

  /**
   * Get a cleaner.
   *
   * @return {Cleaner}
   */
  public getCleaner(): Cleaner {
    return new Cleaner(this);
  }

  /**
   * Get a scoped entityManager. Example:
   *
   *  let wet = new Wetland();
   *  wet.getManager();
   *
   * @returns {Scope}
   */
  public getManager(): Scope {
    return this.entityManager.createScope();
  }

  /**
   * Get the root entity manager.
   *
   * @returns {EntityManager}
   */
  public getEntityManager(): EntityManager {
    return this.entityManager;
  }

  /**
   * Get the migrator.
   *
   * @returns {Migrator}
   */
  public getMigrator(): Migrator {
    if (!this.migrator) {
      this.migrator = new Migrator(this);
    }

    return this.migrator;
  }

  /**
   * Get the schema.
   *
   * @returns {SchemaManager}
   */
  public getSchemaManager(): SchemaManager {
    if (!this.schema) {
      this.schema = new SchemaManager(this);
    }

    return this.schema;
  }

  /**
   * Get the snapshot engine.
   *
   * @returns {SnapshotManager}
   */
  public getSnapshotManager(): SnapshotManager {
    if (!this.snapshotManager) {
      this.snapshotManager = new SnapshotManager(this);
    }

    return this.snapshotManager;
  }

  /**
   * @returns {Populate}
   */
  public getPopulator(scope: Scope): Populate {
    return new Populate(scope);
  }

  /**
   * Destroy all active connections.
   *
   * @returns {Promise<any>}
   */
  public destroyConnections(): Promise<any> {
    let destroys = [];

    Object.getOwnPropertyNames(this.stores).forEach(storeName => {
      let connections = this.stores[storeName].getConnections();

      connections[Store.ROLE_SLAVE].forEach(connection => {
        destroys.push(connection.destroy().then());
      });

      connections[Store.ROLE_MASTER].forEach(connection => {
        destroys.push(connection.destroy().then());
      });
    });

    return Promise.all(destroys);
  }

  /**
   * set of listeners for the exit event.
   */
  private setupExitListeners() {
    process.on('beforeExit', () => this.destroyConnections());
  }

  /**
   * Register a default (fallback) store (sqlite3).
   */
  private registerDefaultStore() {
    try {
      require('sqlite3');
    } catch (error) {
      throw new Error(
        'No stores configured and sqlite3 not found as dependency. ' +
        'Configure a store, or run `npm i --save sqlite3`.',
      );
    }

    this.registerStore(this.config.fetch('defaultStore'), {
      client          : 'sqlite3',
      useNullAsDefault: true,
      connection      : { filename: `${this.config.fetch('dataDirectory')}/wetland.sqlite` },
    });
  }

  /**
   * Ensure that the data directory exists.
   *
   * @param {string} dataDirectory
   */
  private ensureDataDirectory(dataDirectory: string) {
    try {
      fs.statSync(dataDirectory);
    } catch (error) {
      try {
        mkdirp.sync(dataDirectory);
      } catch (error) {
        throw new Error(`Unable to create data directory at '${dataDirectory}'`);
      }
    }
  }
}
