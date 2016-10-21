import * as path from 'path';
import * as Bluebird from 'bluebird';
import * as Knex from 'knex';
import {Wetland} from '../Wetland';
import {Scope} from '../Scope';
import {SchemaBuilder} from '../SchemaBuilder';
import {Run} from './Run';
import {MigratorConfigInterface} from './MigratorConfigInterface';
import {MigrationFile} from './MigrationFile';
import {MigrationTable} from './MigrationTable';
import {Store} from '../Store';

export class Migrator {

  /**
   * @type {string}
   */
  public static DIRECTION_UP: string = 'up';

  /**
   * @type {string}
   */
  public static DIRECTION_DOWN: string = 'down';

  /**
   * @type {string}
   */
  public static ACTION_RUN: string = 'run';

  /**
   * @type {string}
   */
  public static ACTION_GET_SQL: string = 'getSQL';

  /**
   * @type {Wetland}
   */
  private wetland: Wetland;

  /**
   * @type {Scope}
   */
  private manager: Scope;

  /**
   * @type {SchemaBuilder}
   */
  private schemaBuilder: SchemaBuilder;

  /**
   * @type {MigratorConfig}
   */
  private config: MigratorConfigInterface;

  /**
   * @type {MigrationFile}
   */
  private migrationFile: MigrationFile;

  /**
   * @type {MigrationTable}
   */
  private migrationTable: MigrationTable;

  /**
   * @type {Knex}
   */
  private connection: Knex;

  /**
   * Construct a migrator.
   *
   * @param {Wetland} wetland
   */
  public constructor(wetland: Wetland) {
    this.config         = wetland.getConfig().defaults('migrator', {
      store        : null,
      extension    : 'js',
      tableName    : 'wetland_migrations',
      lockTableName: 'wetland_migrations_lock',
      directory    : path.resolve(process.cwd(), './migrations')
    }).fetch('migrator');
    this.wetland        = wetland;
    this.manager        = wetland.getManager();
    this.migrationFile  = new MigrationFile(this.config);
    this.connection     = this.manager.getStore(this.config.store).getConnection(Store.ROLE_MASTER);
    this.migrationTable = new MigrationTable(this.connection, this.config.tableName, this.config.lockTableName);
  }

  /**
   * Get the connection for the migrations tables.
   *
   * @returns {Knex}
   */
  public getConnection(): Knex {
    return this.connection;
  }

  /**
   * Create your database schema.
   *
   * @returns {SchemaBuilder}
   */
  public createSchema(): SchemaBuilder {
    if (!this.schemaBuilder) {
      this.schemaBuilder = new SchemaBuilder(this.manager);
    }

    return this.schemaBuilder.create();
  }

  /**
   * Create a new migration file.
   *
   * @param {string} name
   *
   * @returns {Promise<any>}
   */
  public create(name: string): Bluebird<any> {
    return this.migrationFile.create(name);
  }

  /**
   * Go up one version based on latest run migration timestamp.
   *
   * @param {string} action
   *
   * @returns {Promise}
   */
  public up(action: string): Bluebird<any> {
    return Bluebird.all([this.migrationTable.getLastMigrationName(), this.migrationFile.getMigrations()])
      .spread((name, migrations: Array<string>) => migrations[migrations.indexOf(name) + 1])
      .then(migrations => this.run(Migrator.DIRECTION_UP, action, migrations));
  }

  /**
   * Go down one version based on latest run migration timestamp.
   *
   * @param {string} action
   *
   * @returns {Promise}
   */
  public down(action: string): Promise<string> {
    return this.migrationTable.getLastMigrationName()
      .then(name => this.run(Migrator.DIRECTION_DOWN, action, name));
  }

  /**
   * Go up to the latest migration.
   *
   * @param {string} action
   *
   * @returns {Promise}
   */
  public latest(action: string = Migrator.ACTION_RUN): Bluebird<any> {
    return Bluebird.all([this.migrationTable.getLastMigrationName(), this.migrationFile.getMigrations()])
      .spread((name, migrations: Array<string>) => migrations.slice(migrations.indexOf(name) + 1))
      .then(migrations => this.run(Migrator.DIRECTION_UP, action, migrations));
  }

  /**
   * Revert the last run UP migration (or batch of UP migrations).
   *
   * @param {string} action
   *
   * @returns {Promise}
   */
  public revert(action: string): Promise<any> {
    return this.migrationTable.getLastRun().then(lastRun => this.run(Migrator.DIRECTION_DOWN, action, lastRun));
  }

  /**
   * Run a specific migration.
   *
   * @param {string}    direction
   * @param {string}    action
   * @param {string[]}  migrations
   *
   * @returns {Promise}
   */
  public run(direction: string, action: string, migrations: string | Array<string>): Bluebird<string|any>|Promise<any> {
    if (!Array.isArray(migrations)) {
      migrations = [migrations as string];
    }

    let run = new Run(direction, this.manager, migrations as Array<string>, this.config.directory);

    if (action === Migrator.ACTION_RUN) {
      return this.migrationTable.getLock()
        .then(() => run.run())
        .then(() => this.migrationTable.saveRun(direction, migrations as Array<string>))
        .then(() => this.migrationTable.freeLock());
    }

    if (action === Migrator.ACTION_GET_SQL) {
      return run.getSQL();
    }

    throw new Error(`Invalid action '${action}' supplied.`);
  }
}
