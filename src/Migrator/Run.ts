import {Migrator} from './Migrator';
import {Scope} from '../Scope';
import {Store} from '../Store';
import {Migration} from './Migration';
import * as Bluebird from 'bluebird';
import * as path from 'path';
import * as Knex from 'knex';

/**
 * A single migration run. Multiple migrations can be run in one run.
 * Each migration in the run gets the same run id.
 */
export class Run {

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {string}
   */
  private direction: string;

  /**
   * @type {string}
   */
  private directory: string;

  /**
   * @type {Migration[]}
   */
  private migrations: Array<Migration>;

  /**
   * @type {{}}}
   */
  private transactions: {[key: string]: Knex.Transaction | Bluebird<Knex.Transaction>} = {};

  /**
   * Construct a runner.
   *
   * @param {string}    direction
   * @param {Scope}     entityManager
   * @param {string[]}  migrations
   * @param {string}    directory
   */
  public constructor(direction: string, entityManager: Scope, migrations: Array<string>, directory: string) {
    this.direction     = direction;
    this.directory     = directory;
    this.entityManager = entityManager;

    this.loadMigrations(migrations);
  }

  /**
   * Run the migrations.
   *
   * @returns {Promise}
   */
  public run(): Bluebird<any> {
    return Bluebird.each(this.migrations, migration => migration.run())
      .then(() => {
        return Bluebird.map(Reflect.ownKeys(this.transactions), transaction => {
          return (this.transactions[transaction] as Knex.Transaction).commit();
        });
      })
      .catch(error => {
        return Bluebird.map(Reflect.ownKeys(this.transactions), transaction => {
          return (this.transactions[transaction] as Knex.Transaction).rollback();
        }).then(() => Bluebird.reject(error));
      });
  }

  /**
   * Get the SQL for migrations.
   *
   * @returns {Bluebird<string>}
   */
  public getSQL(): Bluebird<string> {
    return Bluebird.mapSeries(this.migrations, migration => migration.getSQL()).then(result => result.join('\n'));
  }

  /**
   * Get the transaction for this unit of work, and provided target entity.
   *
   * @param {string} storeName
   *
   * @returns {Bluebird<Knex.Transaction>}
   */
  public getTransaction(storeName?: string): Bluebird<Knex.Transaction> {
    let store = this.entityManager.getStore(storeName);

    if (this.transactions[storeName]) {
      if (this.transactions[storeName] instanceof Bluebird) {
        return this.transactions[storeName] as Bluebird<Knex.Transaction>;
      }

      return Bluebird.resolve(this.transactions[storeName]);
    }

    return this.transactions[storeName] = new Bluebird<Knex.Transaction>(resolve => {
      let connection = store.getConnection(Store.ROLE_MASTER);

      connection.transaction(transaction => {
        this.transactions[storeName] = transaction;

        resolve(this.transactions[storeName]);
      });
    });
  }

  /**
   * Load migrations provided.
   *
   * @param {string[]} migrations
   *
   * @returns {Run}
   */
  private loadMigrations(migrations: Array<string>): this {
    if (migrations.length === 0) {
      return this;
    }

    this.migrations = migrations.map(migration => {
      if (!migration) {
        throw new Error('Invalid migration name supplied. Expected string.');
      }

      let migrationClass = require(path.join(this.directory, migration));
      migrationClass     = typeof migrationClass === 'function' ? migrationClass : migrationClass.Migration;

      this.validateMigration(migrationClass);

      return new Migration(migrationClass[this.direction], this);
    });

    return this;
  }

  /**
   * Validate provided migrations
   *
   * @param {Function|{}} migration
   */
  private validateMigration(migration: Function | Object): void {
    if (typeof migration !== 'function' && typeof migration !== 'object') {
      throw new Error(`Migration '${migration}' of type '${typeof migration}' is not of type Function or Object.`);
    }

    if (!Reflect.has(migration, Migrator.DIRECTION_DOWN) || typeof migration[Migrator.DIRECTION_DOWN] !== 'function') {
      throw new Error(`Migration is missing a '${Migrator.DIRECTION_DOWN}' method.`);
    }

    if (!Reflect.has(migration, Migrator.DIRECTION_UP) || typeof migration[Migrator.DIRECTION_UP] !== 'function') {
      throw new Error(`Migration is missing a '${Migrator.DIRECTION_UP}' method.`);
    }
  }

  /**
   * Get the entity manager scope.
   *
   * @returns {Scope}
   */
  public getEntityManager(): Scope {
    return this.entityManager;
  }
}
