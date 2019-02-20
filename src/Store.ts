import * as knex from 'knex';

export class Store {
  /**
   * @type {string}
   */
  public static MODE_SINGLE = 'single';

  /**
   * @type {string}
   */
  public static MODE_POOL = 'pool';

  /**
   * @type {string}
   */
  public static MODE_REPLICATION = 'replication';

  /**
   * @type {string}
   */
  public static ROLE_MASTER = 'master';

  /**
   * @type {string}
   */
  public static ROLE_SLAVE = 'slave';

  /**
   * @type {string}
   */
  private client: string;

  /**
   * @type {string}
   */
  private name: string;

  /**
   * @type {string}
   */
  private mode: string = Store.MODE_SINGLE;

  /**
   * @type {{}}
   */
  private connections: Object = {
    [Store.ROLE_MASTER]: [],
    [Store.ROLE_SLAVE]: [],
  };

  /**
   * @type {{}}
   */
  private pointers: Object = {
    [Store.ROLE_MASTER]: 0,
    [Store.ROLE_SLAVE]: 0,
  };

  /**
   * Construct a new store.
   *
   * @param {string} name
   * @param {{}}     [config]
   */
  public constructor(name: string, config?: PoolConfig | ReplicationConfig | SingleConfig) {
    this.name = name;

    if (config) {
      this.register(config);
    }
  }

  /**
   * Get the name of the store.
   *
   * @returns {string}
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Register connections.
   *
   * @param {PoolConfig|ReplicationConfig|SingleConfig} config
   *
   * @returns {Store}
   */
  public register(config: PoolConfig | ReplicationConfig | SingleConfig): Store {
    if (Array.isArray((config as PoolConfig).connections)) {
      this.registerPool(config as PoolConfig);
    } else if (typeof (config as ReplicationConfig).connections === 'object') {
      this.registerReplication(config as ReplicationConfig);
    } else if (typeof (config as SingleConfig).connection === 'object') {
      this.registerConnection(config as SingleConfig);
    }

    return this;
  }

  /**
   * Register a connection.
   *
   * @param {SingleConfig} config
   * @param {string}       [role]
   *
   * @returns {Store}
   */
  public registerConnection(config: SingleConfig, role: string = null): Store {
    if ([Store.ROLE_MASTER, Store.ROLE_SLAVE, null].indexOf(role) === -1) {
      throw new Error(
        `Trying to register using invalid role. Expected "${Store.ROLE_MASTER}" or "${Store.ROLE_SLAVE}".`,
      );
    }

    const connection = knex(config);

    if (role === Store.ROLE_MASTER || role === null) {
      this.connections[Store.ROLE_MASTER].push(connection);
    }

    if (role === Store.ROLE_SLAVE || role === null) {
      this.connections[Store.ROLE_SLAVE].push(connection);
    }

    this.client = config.client;

    return this;
  }

  /**
   * Get the name of the client.
   *
   * @returns {string}
   */
  public getClient(): string {
    return this.client;
  }

  /**
   * Get the connections registered on this store.
   *
   * @returns {Object}
   */
  public getConnections(): Object {
    return this.connections;
  }

  /**
   * Get a connection for `role`. Uses round robin.
   *
   * @param {string} role
   *
   * @returns {knex}
   */
  public getConnection(role: string = Store.ROLE_SLAVE): knex {
    if (this.mode === Store.MODE_SINGLE) {
      return this.connections[role][0];
    }

    const connection = this.connections[role][this.pointers[role]++];

    if (this.pointers[role] >= this.connections[role].length) {
      this.pointers[role] = 0;
    }

    return connection;
  }

  /**
   * Register pool of connections. Example config:
   *
   *  // Connection object could look like: {username: '', password: '', database: '', host: ''}
   *  {
   *    client     : 'mysql',
   *    connections: [{}, {}]
   *  }
   *
   * @param {PoolConfig} config
   *
   * @returns Store
   */
  public registerPool(config: PoolConfig): Store {
    this.mode = Store.MODE_POOL;

    config.connections.forEach(connection => {
      this.registerConnection(this.makeConnectionConfig(config, connection));
    });

    return this;
  }

  /**
   * Register replication connections. Example config:
   *
   *  // Connection object could look like: {username: '', password: '', database: '', host: ''}
   *  {
   *    client     : 'mysql',
   *    connections: {
   *      master: [{}, {}],
   *      slave : [{}, {}, {}]
   *    }
   *  }
   *
   * @param {ReplicationConfig} config
   *
   * @returns Store
   */
  public registerReplication(config: ReplicationConfig): Store {
    this.mode = Store.MODE_REPLICATION;

    Object.getOwnPropertyNames(config.connections).forEach(role => {
      config.connections[role].forEach(connection => {
        this.registerConnection(this.makeConnectionConfig(config, connection), role);
      });
    });

    return this;
  }

  /**
   * Makes the config needed for knex.
   * This method is needed because (for example) postgres accepts extra arguments such as a searchPath.
   *
   * @param {{}} config
   * @param {{}} connection
   *
   * @returns {SingleConfig}
   */
  private makeConnectionConfig(config: Object, connection: Object): SingleConfig {
    const connectionConfig = { connection };

    Object.getOwnPropertyNames(config).forEach(key => {
      if (key === 'connection' || key === 'connections') {
        return;
      }

      connectionConfig[key] = config[key];
    });

    return connectionConfig;
  }
}

export interface Connection {
  [key: string]: any;
}

export interface SingleConfig {
  debug?: boolean;
  connection: Connection;
  client?: string;
}

export interface PoolConfig {
  debug?: boolean;
  client: string;
  connections: Array<Connection>;

  [key: string]: any;
}

export interface ReplicationConfig {
  debug?: boolean;
  client: string;
  connections: {
    master?: Array<Connection>,
    slave?: Array<Connection>,
  };

  [key: string]: any;
}
