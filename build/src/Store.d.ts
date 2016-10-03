/// <reference types="chai" />
/// <reference types="knex" />
import * as knex from 'knex';
export declare class Store {
    /**
     * @type {string}
     */
    static MODE_SINGLE: string;
    /**
     * @type {string}
     */
    static MODE_POOL: string;
    /**
     * @type {string}
     */
    static MODE_REPLICATION: string;
    /**
     * @type {string}
     */
    static ROLE_MASTER: string;
    /**
     * @type {string}
     */
    static ROLE_SLAVE: string;
    /**
     * @type {{}}
     */
    private config;
    /**
     * @type {string}
     */
    private name;
    /**
     * @type {string}
     */
    private mode;
    /**
     * @type {{}}
     */
    private connections;
    /**
     * @type {{}}
     */
    private pointers;
    /**
     * Construct a new store.
     *
     * @param {string} name
     * @param {{}}     [config]
     */
    constructor(name: string, config?: PoolConfig | ReplicationConfig | SingleConfig);
    /**
     * Get the name of the store.
     *
     * @returns {string}
     */
    getName(): string;
    /**
     * Register connections.
     *
     * @param {PoolConfig|ReplicationConfig|SingleConfig} config
     *
     * @returns {Store}
     */
    register(config: PoolConfig | ReplicationConfig | SingleConfig): Store;
    /**
     * Register a connection.
     *
     * @param {SingleConfig} config
     * @param {string}       [role]
     *
     * @returns {Store}
     */
    registerConnection(config: SingleConfig, role?: string): Store;
    /**
     * Get the connections registered on this store.
     *
     * @returns {Object}
     */
    getConnections(): Object;
    /**
     * Get a connection for `role`. Uses round robin.
     *
     * @param {string} role
     *
     * @returns {knex}
     */
    getConnection(role?: string): knex;
    /**
     * Makes the config needed for knex.
     * This method is needed because (for example) postgres accepts extra arguments such as a searchPath.
     *
     * @param {{}} config
     * @param {{}} connection
     *
     * @returns {SingleConfig}
     */
    private makeConnectionConfig(config, connection);
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
    registerPool(config: PoolConfig): Store;
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
    registerReplication(config: ReplicationConfig): Store;
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
        master?: Array<Connection>;
        slave?: Array<Connection>;
    };
    [key: string]: any;
}
