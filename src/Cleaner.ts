import {Wetland} from './Wetland';
import {Connection, Store} from './Store';
import {SnapshotManager} from './SnapshotManager';
import * as rm from 'del';
import * as path from 'path';

export class Cleaner {

  wetland: Wetland;

  /**
   * Construct a cleaner instance.
   *
   * @param {Wetland} wetland
   */
  constructor(wetland: Wetland) {
    this.wetland = wetland;
  }

  /**
   * Clean the dev snapshots in the data directory.
   *
   * @return {Promise<any>}
   */
  private cleanDataDirectory(): Promise<any> {
    return rm(path.join(this.wetland.getConfig().fetch('dataDirectory'), SnapshotManager.DEV_SNAPSHOTS_PATH, '*'))
      .catch(error => {
        if (error.code === 'ENOENT') {
          return Promise.resolve();
        }

        return Promise.reject(error);
      })
  }

  /**
   * Generate drop table queries for all wetland's registered entities table name.
   *
   * @param {Connection} connection
   * @return {Array<Promise<any>>}
   */
  private generateDropTableQueries(connection: Connection): Array<Promise<any>> {
    const entities = this.wetland.getManager().getEntities();

    const dropTablesQueries = [];

    Reflect.ownKeys(entities).forEach(entityName => {
      dropTablesQueries.push(connection.raw(`DROP TABLE IF EXISTS ${entities[entityName].mapping.getTableName()}`));
    });

    return dropTablesQueries;
  }

  /**
   * Drop all tables' entities.
   *
   * @param store
   * @return {Promise<any>}
   */
  private dropTables(store: Store): Promise<any> {

    function alterForeignKeyChecks(status: boolean): Promise<any> {
      if (store.getClient() === 'sqlite3') {
        let statusText = status ? 'ON' : 'OFF';

        return connection.raw(`PRAGMA foreign_keys=${statusText}`);
      }

      let statusText = status ? 1 : 0;

      return connection.raw(`SET FOREIGN_KEY_CHECKS=${statusText};`);
    }

    const disableForeignKeyChecks = (): Promise<any> => alterForeignKeyChecks(false);

    const enableForeignKeyChecks = (): Promise<any> => alterForeignKeyChecks(true);

    const connection = store.getConnection(Store.ROLE_MASTER);

    return disableForeignKeyChecks()
      .then(() => Promise.all(this.generateDropTableQueries(connection)))
      .then(() => enableForeignKeyChecks());
  }

  /**
   * Clean wetland's related tables and wetland's dev snapshots'.
   *
   * @return {Promise<any>}
   */
  public clean(): Promise<any> {
    return this.dropTables(this.wetland.getStore())
      .then(() => this.cleanDataDirectory());
  }
}
