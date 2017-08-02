import {Wetland} from './Wetland';
import {Connection, Store} from './Store';
import {SnapshotManager} from './SnapshotManager';
import * as rm from 'del';
import * as path from 'path';
import {SchemaBuilder} from "./SchemaBuilder";

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
   * Drop all tables' entities.
   *
   * @return {Promise<any>}
   */
  private dropTables(): any {
    const manager         = this.wetland.getManager();
    const snapshotManager = this.wetland.getSnapshotManager();
    const schemaBuilder   = new SchemaBuilder(manager);

    return snapshotManager
      .fetch()
      .then(previous => {
        let instructions = snapshotManager.diff(previous, {});

        return schemaBuilder.process(instructions).apply();
      });
  }

  /**
   * Clean wetland's related tables and wetland's dev snapshots'.
   *
   * @return {Promise<any>}
   */
  public clean(): Promise<any> {
    return this.dropTables()
      .then(() => this.cleanDataDirectory());
  }
}
