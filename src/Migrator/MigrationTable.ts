import * as Knex from 'knex';
import { Migrator } from './Migrator';

export class MigrationTable {
  /**
   * @type {Knex}
   */
  private connection: Knex;

  /**
   * @type {string}
   */
  private tableName: string;

  /**
   * @type {string}
   */
  private lockTableName: string;

  /**
   * Construct migrationTable.
   *
   * @param {Knex}   connection
   * @param {string} tableName
   * @param {string} lockTableName
   */
  public constructor(connection: Knex, tableName: string, lockTableName: string) {
    this.connection    = connection;
    this.tableName     = tableName;
    this.lockTableName = lockTableName;
  }

  /**
   * Check if migrations is locked.
   *
   * @param {Knex.Transaction} transaction
   *
   * @returns {Promise<boolean>}
   */
  private isLocked(transaction: Knex.Transaction): Promise<boolean> {
    const isLocked = this.connection(this.lockTableName)
      .transacting(transaction)
      .forUpdate()
      .select('*')
      .then(data => !!data[0] && !!data[0].locked);

    return Promise.resolve(isLocked);
  }

  /**
   * Lock migrations.
   *
   * @param {Knex.Transaction} transaction
   *
   * @returns {QueryBuilder}
   */
  private lockMigrations(transaction): Promise<any> {
    return Promise.resolve(this.connection(this.lockTableName).transacting(transaction).update({ locked: 1 }));
  }

  /**
   * Obtain a lock.
   *
   * @returns {Promise<any>}
   */
  public getLock(): Promise<any> {
    return this.ensureMigrationTables().then(() => {
      return this.connection.transaction(transaction => {
        return this.isLocked(transaction)
          .then(isLocked => {
            if (isLocked) {
              throw new Error('Migration table is already locked');
            }
          })
          .then(() => this.lockMigrations(transaction));
      });
    });
  }

  /**
   * Free a lock.
   *
   * @returns {QueryBuilder}
   */
  public freeLock(): Promise<any> {
    return Promise.resolve(this.connection(this.lockTableName).update({ locked: 0 }));
  }

  /**
   * Ensure the migration tables exist.
   *
   * @returns {Promise<any>}
   */
  private async ensureMigrationTables(): Promise<any> {
    const connection = this.connection;
    const migrationTableExists = await connection.schema.hasTable(this.tableName);

    if (migrationTableExists) {
      return;
    }

    await connection.schema.createTable(this.tableName, t => {
      t.increments();
      t.string('name');
      t.integer('run');
      t.timestamp('migration_time').defaultTo(connection.fn.now());
      t.index([ 'run' ]);
      t.index([ 'migration_time' ]);
    });

    const lockTableExists = await connection.schema.hasTable(this.lockTableName);

    if (lockTableExists) {
      return;
    }

    await connection.schema.createTable(this.lockTableName, t => t.boolean('locked'));

    return connection.schema;
  }

  /**
   * Get the ID of the last run.
   *
   * @returns {Promise<number|null>}
   */
  public getLastRunId(): Promise<number|null> {
    const lastRunId = this.connection(this.tableName)
      .select('run')
      .limit(1)
      .orderBy('run', 'desc')
      .then(result => result[0] ? result[0].run : null);

    return Promise.resolve(lastRunId);
  }

  /**
   * Get the name of the last run migration.
   *
   * @returns {Promise<string|null>}
   */
  public getLastMigrationName(): Promise<string|null> {
    return this.ensureMigrationTables().then(() => {
      return this.connection(this.tableName)
        .select('name')
        .limit(1)
        .orderBy('id', 'desc')
        .then(result => result[0] ? result[0].name : null);
    });
  }

  /**
   * Get the names of the migrations that were part of the last run.
   *
   * @returns {Promise<Array<string>|null>}
   */
  public getLastRun(): Promise<Array<string>|null> {
    return this.getLastRunId().then(lastRun => {
      if (lastRun === null) {
        return null;
      }

      let connection = this.connection(this.tableName)
        .select('name')
        .where('run', lastRun)
        .orderBy('id', 'desc');

      return connection.then(results => results.map(result => result.name));
    });
  }

  /**
   * Get the names of the migrations that were run.
   *
   * @returns {Promise<Array<string>|null>}
   */
  public getAllRun(): Promise<Array<Object>|null> {
    return this.ensureMigrationTables().then(() => {
      return this.connection(this.tableName)
        .orderBy('id', 'desc');
    });
  }

  /**
   * Save the last run.
   *
   * @param {string}   direction
   * @param {string[]} migrations
   *
   * @returns {Promise}
   */
  public saveRun(direction: string, migrations: Array<string>): Promise<any> {
    if (direction === Migrator.DIRECTION_DOWN) {
      return Promise.resolve(this.connection(this.tableName).whereIn('name', migrations).del());
    }

    return this.getLastRunId().then(lastRun => {
      return this.connection(this.tableName).insert(migrations.map(name => {
        return { name, run: (lastRun + 1) };
      }));
    });
  }
}
