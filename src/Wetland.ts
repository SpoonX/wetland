import {EntityManager} from './EntityManager';
import {Store, PoolConfig, ReplicationConfig, SingleConfig} from './Store';
import {Homefront} from 'homefront';
import {Scope} from './Scope';
import {EntityInterface, EntityCtor} from './EntityInterface';
import {Migrator} from './Migrator';

export class Wetland {
  /**
   * @type {EntityManager}
   */
  private manager: EntityManager = new EntityManager(this);

  /**
   * @type {Migrator}
   */
  private migrator: Migrator;

  /**
   * @type {Homefront}
   */
  private config: Homefront = new Homefront({
    debug        : false,
    defaultStore : 'default',
    entityManager: {
      refreshCreated: true,
      refreshUpdated: true
    }
  });

  /**
   * @type {{}}
   */
  private stores: {[key: string]: Store} = {};

  /**
   * Construct a new wetland instance.
   *
   * @param {{}} config
   */
  public constructor(config?: Object) {
    this.setupExitListeners();

    if (!config) {
      return;
    }

    this.config.merge(config);

    let stores   = this.config.fetch('stores');
    let entities = this.config.fetch('entities');

    if (stores) {
      this.registerStores(stores);
    }

    if (entities) {
      this.registerEntities(entities);
    }
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
    this.manager.registerEntity(entity);

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
    this.manager.registerEntities(entities);

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
      throw new Error(`No store called "${storeName}" found.`)
    }

    return store;
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
    return this.manager.createScope();
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
}
